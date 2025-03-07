from abc import ABCMeta, abstractmethod
from typing import List, Tuple, Optional

from common import HttpStatus, Language
from util import resolve_archive
from vo import ModuleDeps, PackageDeps, ModuleMeta


class DepsHandler(Language, metaclass=ABCMeta):

    @abstractmethod
    def deps(self, module: str, data: bytes) -> Tuple[Optional[ModuleDeps], HttpStatus]:
        pass

    @abstractmethod
    def search(self, lang: str, purl: str) -> Tuple[Optional[ModuleDeps], HttpStatus]:
        pass

    @abstractmethod
    def meta(self, lang: str, purl: str) -> Tuple[Optional[ModuleMeta], HttpStatus]:
        pass


class ArchiveDepsHandler(DepsHandler):

    def exts(self) -> List[str]:
        return ['.*']

    def lang(self) -> str:
        return '*'

    def modules(self) -> List[str]:
        return ['*']

    def __init__(self, handlers: List[DepsHandler]):
        self._handlers: List[DepsHandler] = handlers

    @classmethod
    def with_handlers(cls, handlers: List[DepsHandler]):
        return ArchiveDepsHandler(handlers)

    def deps(self, module: str, data: bytes) -> Tuple[Optional[ModuleDeps], HttpStatus]:
        archive = resolve_archive(data)
        if not archive:
            return None, HttpStatus.ILLEGAL_FILE
        # key: 处理者, value: 依赖文件路径，依赖文件类型，依赖文件内容
        module_deps: List[ModuleDeps] = []

        def get(name: str):
            for h in self._handlers:
                # 统计依赖文件
                m = list(filter(lambda m: name.lower().endswith(m), h.modules()))
                if len(m):
                    try:
                        dep, status = h.deps(name.lower(), archive.get_file_by_name(name))
                        if status == HttpStatus.OK:
                            module_deps.append(dep)
                    except Exception as e:
                        print(e)
                    break

        archive.iter(get)
        return PackageDeps(modules=module_deps, path=module), HttpStatus.OK

    def search(self, lang: str, purl: str) -> Tuple[Optional[ModuleDeps], HttpStatus]:
        for h in self._handlers:
            if lang == h.lang():
                return h.search(lang, purl)
        return None, HttpStatus.NOT_SUPPORT

    def meta(self, lang: str, purl: str) -> Tuple[Optional[ModuleMeta], HttpStatus]:
        for h in self._handlers:
            if lang == h.lang():
                return h.meta(lang, purl)
        return None, HttpStatus.NOT_SUPPORT
