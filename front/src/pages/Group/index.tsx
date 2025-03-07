import {
    DrawerForm,
    PageContainer,
    ProDescriptions, ProFormDependency,
    ProFormGroup, ProFormList, ProFormSelect,
    ProFormText,
    ProList
} from "@ant-design/pro-components"
import {useModel} from "@@/exports";
import {Badge, Button, Form, message, Popconfirm, Space, Tooltip, Typography} from "antd";
import React, {useState} from "react";
import type {Key} from 'react';
import {ParamTypeOptions, RootGroupID} from "@/constants";
import {createGroup, dropGroup} from "@/services/graph/graph";
import {PlusOutlined, QuestionCircleOutlined} from "@ant-design/icons";
import ProCard from "@ant-design/pro-card";
import {genGroupOptions, TreeNodeGroup} from "@/models/global";
import {
    nodeStyleEnum,
    nodeStyleOptions,
    edgeStyleEnum,
    edgeStyleOptions,
    edgeDirectEnum,
    edgeDirectOptions, defaultGroup
} from "@/pages/Group/_group";

const {Text} = Typography;

const Group: React.FC = () => {
    const {groups} = useModel('global')
    const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([]);

    const getAttrBadge = (primary: boolean) => {
        if (primary) {
            return <Badge color='#DC143C' text='主属性'/>
        }
        return <Badge color='#A9A9A9' text='属性'/>
    }

    const getAttrsDesc = (attrs: Graph.Attr[] | undefined, primary: string | undefined) => {
        return attrs?.sort((a, b) => a.name == primary ? -1 : b.name == primary ? 1 : a.name < b.name ? -1 : 1).map(a =>
            <ProDescriptions.Item key={a.name} span={3}>
                <ProDescriptions dataSource={a} key={a.name}
                                 style={{paddingBottom: 0}}>
                    <ProDescriptions.Item dataIndex={'name'} label={getAttrBadge(a.name == primary)}
                                          valueType={'text'}/>
                    <ProDescriptions.Item dataIndex={'desc'} label={'描述'} valueType={'text'}/>
                    <ProDescriptions.Item label={'类型'}
                                          render={(_, t) => ParamTypeOptions[t['type']].label}/>
                </ProDescriptions>
            </ProDescriptions.Item>)
    }

    const getGroupDesc = (group: TreeNodeGroup) => {
        return <ProDescriptions key={group.id} column={1}>
            {
                group.nodeTypeList.map((n, i) =>
                    <ProDescriptions.Item key={i} label={<a style={{minWidth: 128}}>节点{i + 1} ({n.name})</a>}>
                        <ProDescriptions dataSource={n} key={n.id} column={3}>
                            <ProDescriptions.Item dataIndex={'display'} label={<Badge color={"cyan"} text={'风格'}/>}
                                                  valueEnum={nodeStyleEnum}/>
                            <ProDescriptions.Item dataIndex={'desc'} label={'描述'} valueType={'text'} span={2}/>
                            {getAttrsDesc(n.attrs, n.primary)}
                        </ProDescriptions>
                    </ProDescriptions.Item>
                )
            }
            {
                group.edgeTypeList.map((e, i) =>
                    <ProDescriptions.Item key={i} label={<a style={{minWidth: 128}}>边{i + 1} ({e.name})</a>}> {
                        <ProDescriptions dataSource={e} key={e.id} column={3}>
                            <ProDescriptions.Item dataIndex={'display'} label={<Badge color={"cyan"} text={'风格'}/>}
                                                  valueEnum={edgeStyleEnum}/>
                            <ProDescriptions.Item dataIndex={'edgeDirection'} label={'方向'}
                                //@ts-ignore
                                                  valueEnum={edgeDirectEnum}/>
                            <ProDescriptions.Item dataIndex={'desc'} label={'描述'} valueType={'text'}/>
                            {getAttrsDesc(e.attrs, e.primary)}
                        </ProDescriptions>
                    }
                    </ProDescriptions.Item>
                )
            }
        </ProDescriptions>
    }

    // 创建图结构的drawer
    const getCreateGroupModal = () => {
        // form提交处理函数
        const handleCreateGroup = async (vs: FormData) => {
            let edgeTypeList: Graph.Structure[] = [], nodeTypeList: Graph.Structure[] = []
            // 插入新建的节点和边
            for (let v of vs.entities) {
                if (v.type === 'node') {
                    nodeTypeList.push({
                        id: 0,
                        attrs: v.attrs,
                        desc: v.desc,
                        display: v.display,
                        edgeDirection: false,
                        primary: v.attrs?.find(a => a.primary)?.name,
                        name: v.name
                    })
                } else {
                    edgeTypeList.push({
                        id: 0,
                        attrs: v.attrs,
                        desc: v.desc,
                        display: v.display,
                        edgeDirection: v.direct,
                        primary: v.attrs?.find(a => a.primary)?.name,
                        name: v.name
                    })
                }
            }
            // 插入继承自父图结构的节点和边
            let parentGroup = groups.find(g => g.id == vs.parentId)
            while (parentGroup && parentGroup.id !== RootGroupID) {
                nodeTypeList.push(...parentGroup.nodeTypeList)
                edgeTypeList.push(...parentGroup.edgeTypeList)
                parentGroup = parentGroup!.parentGroup
            }
            return await createGroup({
                name: vs.name,
                desc: vs.desc,
                edgeTypeList: edgeTypeList,
                nodeTypeList: nodeTypeList,
                parentId: vs.parentId ? vs.parentId : RootGroupID
            }).then(() => {
                message.success('图结构创建成功！')
                window.location.reload()
                return true
            }).catch(e => {
                console.log(e)
            })
        }
        type FormData = {
            name: string, desc: string, parentId: number, entities: {
                name: string, desc: string, type: string, display: string, direct: boolean,
                attrs: { name: string, desc: string, type: number, primary: boolean }[]
            }[]
        }
        const [form] = Form.useForm<FormData>()
        return <DrawerForm<FormData>
            title='新建图结构'
            resize={{
                maxWidth: window.innerWidth * 0.8,
                minWidth: window.innerWidth * 0.6,
            }}
            form={form}
            trigger={
                <Button type='primary'>
                    <PlusOutlined/>
                    新建图结构
                </Button>
            }
            autoFocusFirstInput
            drawerProps={{
                destroyOnClose: true,
            }}
            onFinish={handleCreateGroup}
        >
            <ProFormGroup title='图结构配置'>
                <ProFormText name='name' label='名称' rules={[{required: true}]}/>
                <ProFormText name='desc' label='描述' rules={[{required: true}]}/>
                <ProFormSelect name='parentId' label={<Tooltip title={'子图结构将继承父图结构的全部节点与边'}><span>父图结构</span></Tooltip>}
                               options={genGroupOptions(groups)} initialValue={1}/>
            </ProFormGroup>
            <ProFormList
                label={(<Text strong>实体组配置</Text>)}
                initialValue={defaultGroup}
                name='entities'
                creatorButtonProps={{
                    creatorButtonText: '添加一个实体'
                }}
                itemRender={({listDom, action}, {record}) => {
                    return (
                        <ProCard
                            bordered
                            extra={action}
                            title={record?.name}
                            style={{
                                marginBlockEnd: 8,
                            }}
                        >
                            {listDom}
                        </ProCard>
                    );
                }}
            >
                <ProFormGroup>
                    <ProFormText name='name' label='名称'/>
                    <ProFormText name='desc' label='描述'/>
                    <ProFormSelect
                        initialValue={'node'}
                        options={[
                            {
                                label: '节点',
                                value: 'node'
                            }, {
                                label: '边',
                                value: 'edge'
                            }
                        ]}
                        name='type'
                        label='实体类型'
                    />
                    <ProFormDependency key="d2" name={['type']}>
                        {({type}) => {
                            if (type === 'node') {
                                return <ProFormSelect
                                    initialValue={'color'}
                                    options={nodeStyleOptions}
                                    name='display'
                                    label='展示'
                                />
                            }
                            if (type === 'edge') {
                                return <Space size={"large"}>
                                    <ProFormSelect
                                        initialValue={true}
                                        options={edgeDirectOptions}
                                        name='direct'
                                        label='方向'
                                    />
                                    <ProFormSelect
                                        initialValue={'real'}
                                        options={edgeStyleOptions}
                                        name='display'
                                        label='展示'
                                    />
                                </Space>
                            }
                        }}
                    </ProFormDependency>
                </ProFormGroup>
                <ProFormList
                    creatorButtonProps={{
                        creatorButtonText: '添加一个属性'
                    }}
                    name='attrs'
                    label='属性'
                    deleteIconProps={{
                        tooltipText: '删除本行',
                    }}
                >
                    <ProFormGroup key='group'>
                        <ProFormText name='name' label='名称'/>
                        <ProFormText name='desc' label='描述'/>
                        <ProFormSelect
                            initialValue={0}
                            options={ParamTypeOptions}
                            name='type'
                            label='类型'
                        />
                        <ProFormSelect
                            initialValue={false}
                            options={[
                                {
                                    label: '是',
                                    value: true
                                }, {
                                    label: '否',
                                    value: false
                                }
                            ]}
                            name='primary'
                            label={<Tooltip title={'节点或边的主属性将建立查询索引，被用于标志、搜索及展示该节点或边。建议使用可以区分不同节点或边的属性作为主属性。主属性只能有一个。'}>
                                <span>主属性</span></Tooltip>}
                        />
                    </ProFormGroup>
                </ProFormList>
            </ProFormList>
        </DrawerForm>
    }

    return <PageContainer title={false}>

        <ProList<TreeNodeGroup>
            rowKey="id"
            headerTitle='图谱结构'
            toolBarRender={() => {
                return [
                    getCreateGroupModal(),
                ];
            }}
            expandable={{expandedRowKeys, onExpandedRowsChange: setExpandedRowKeys}}
            dataSource={groups}
            metas={{
                title: {dataIndex: 'desc'},
                description: {
                    render: (_, g) => getGroupDesc(g),
                },
                actions: {
                    render: (_, g) => {
                        return <Popconfirm
                            title="确认删除？"
                            description="将移除应用该图结构及子结构的所有图谱"
                            icon={<QuestionCircleOutlined style={{color: 'red'}}/>}
                            onConfirm={() => {
                                dropGroup({groupId: g.id}).then(_ => window.location.reload())
                            }}
                        >
                            <Button danger>删除</Button>
                        </Popconfirm>
                    },
                },
            }}
        />
    </PageContainer>
}

export default Group