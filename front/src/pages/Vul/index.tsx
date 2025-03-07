import {
    PageContainer, ProList,
} from '@ant-design/pro-components';
import {Button, Form, message, Popconfirm, Space, Tag, Typography} from 'antd';
import React, {type Key, useState} from 'react';
import {request} from "@@/exports";

type VulResp = {
    _id: string,
    aliases: string[],
    database_specific: {
        osv?: {
            id: string,
            summary: string,
            details: string,
            aliases: string[],
            modified: string,
            published: string,
            database_specific: {
                nvd_published_at?: string,
                github_reviewed_at: string,
                severity: string,
                github_reviewed: boolean,
                cwe_ids: []
            },
            references: { type: string, url: string }[],
        }[],
        exploit_db?: {
            id: string,
            file: string,
            description: string,
            date_published: string,
            author: string,
            type: string,
            platform: string,
            port: string,
            date_added: string,
            date_updated: string,
            verified: string,
            codes: string,
            tags: string,
            aliases: string[],
            screenshot_url: string,
            application_url: string,
            source_url: string
        }[]
    }
}

type VulInfo = {
    id: string,
    name: string,
    aliases: string[],
    score?: string,
    updatedAt: string,
    description: string,
    detail: string,
    source: string
}
const VulList: React.FC = () => {
    const searchVulByPage = async (params: Record<string, any>) => {
        if (params.keywords === undefined) {
            return {
                success: false,
                data: []
            }
        }
        const res: {
            total: number,
            result: VulResp[]
        } = (await request('/api/vul/api/searchVuln', {
            timeout: 5000,
            method: 'get',
            params: {
                'batch': 1,
                'input': {"0": {"query": params.keywords, "pageSize": params.pageSize, "page": params.current}}
            }
        }))[0].result.data
        return {
            success: true,
            total: res.total,
            data: res.result.map((v: VulResp) => {
                    let r = parseOSV(v)
                    if (r === undefined) {
                        r = parseExploitDB(v)
                    }
                    return r
                }
            ).filter((v: VulInfo | undefined) => v !== undefined)
        }
    }

    const parseOSV = (v: VulResp): VulInfo | undefined => {
        if (v.database_specific.osv === undefined) {
            return undefined
        }
        const aliases = v.aliases?.sort((a, b) => a.includes('CVE') ? -1 : 1)
        const updated = v.database_specific.osv[0].modified
        return {
            id: v._id,
            name: aliases?.length > 0 ? aliases[0] : v._id,
            aliases: aliases?.length > 1 ? aliases.slice(1) : [],
            score: v.database_specific.osv[0].database_specific?.severity?.toUpperCase(),
            updatedAt: updated.slice(0, updated.indexOf('.')),
            description: v.database_specific.osv[0].summary,
            detail: v.database_specific.osv[0].details,
            source: 'OSV'
        }
    }

    const parseExploitDB = (v: VulResp): VulInfo | undefined => {
        if (v.database_specific.exploit_db === undefined) {
            console.debug(v)
            return undefined
        }
        const aliases = v.aliases?.sort((a, b) => a.includes('CVE') ? -1 : 1)
        return {
            id: v._id,
            name: aliases?.length > 0 ? aliases[0] : v._id,
            aliases: aliases?.length > 1 ? aliases.slice(1) : [],
            updatedAt: v.database_specific.exploit_db[0].date_updated,
            description: v.database_specific.exploit_db[0].description,
            detail: v.database_specific.exploit_db[0].description,
            source: 'ExploitDB'
        }
    }

    const getSeverity = (v: string | undefined) => {
        if (v === 'CRITICAL') {
            return <Tag color={'red'}>{v}</Tag>
        } else if (v === 'HIGH') {
            return <Tag color={'orange'}>{v}</Tag>
        } else if (v === 'MEDIUM' || v === 'MODERATE') {
            return <Tag color={'yellow'}>{v}</Tag>
        } else if (v === 'LOW') {
            return <Tag color={'green'}>{v}</Tag>
        } else if (v === undefined) {
            return null
        } else {
            return <Tag color={'blue'}>{v}</Tag>
        }
    }

    const getSource = (v: string) => {
        if (v === 'OSV') {
            return <Tag color={'blue'}>{v}</Tag>
        } else if (v === 'ExploitDB') {
            return <Tag color={'purple'}>{v}</Tag>
        } else {
            return <Tag color={'gray'}>{v}</Tag>
        }
    }

    const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([]);

    return <PageContainer title={false}>
        <ProList<VulInfo>
            rowKey="id"
            search={{}}
            headerTitle='TIG漏洞情报库'
            expandable={{expandedRowKeys, onExpandedRowsChange: setExpandedRowKeys}}
            request={searchVulByPage}
            pagination={{
                pageSize: 10,
            }}
            metas={{
                title: {dataIndex: 'name', search: false},
                keywords: {title: 'keywords'},
                description: {
                    dataIndex: 'detail',
                    search: false,
                },
                subTitle: {
                    render: (_, row) => {
                        return (
                            <Space>
                                {row.aliases.slice(0, Math.min(3, row.aliases.length)).map((a: string) => <Tag
                                    key={a}>{a}</Tag>)}
                                {getSeverity(row.score)}
                                {getSource(row.source)}
                            </Space>
                        );
                    },
                    search: false,
                },
                actions: {
                    render: (_, row) => [
                        <a>{row.updatedAt}</a>
                    ],
                    search: false,
                }
            }}
        />
    </PageContainer>
};

export default VulList;

