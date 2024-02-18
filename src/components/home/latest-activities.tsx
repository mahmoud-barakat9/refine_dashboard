import { UnorderedListOutlined } from '@ant-design/icons'
import { Card, List, Space } from 'antd'
import React from 'react'
import { Text } from '../text'
import LatestActivitiesSkeleton from '../skeleton/latest-activities'
import { useList } from '@refinedev/core'
import { DASHBOARD_LATEST_ACTIVITIES_AUDITS_QUERY, DASHBOARD_LATEST_ACTIVITIES_DEALS_QUERY } from '@/graphql/queries'
import dayjs from 'dayjs'
import CustomAvatar from '../custom-avatar'
import { GetFieldsFromList } from '@refinedev/nestjs-query'
import { DashboardLatestActivitiesAuditsQuery, DashboardLatestActivitiesDealsQuery } from '@/graphql/types'

const LatestActivities = () => {
    // const { data: audit, isLoading: isLoadingAudit, isError, error } = useList({
    //     resource: 'audits',
    //     meta: {
    //         gqlQuery: DASHBOARD_LATEST_ACTIVITIES_AUDITS_QUERY
    //     }
    // })
    const {
        data: audit,
        isLoading: isLoadingAudit,
        isError,
        error,
    } = useList<GetFieldsFromList<DashboardLatestActivitiesAuditsQuery>>({
        resource: "audits",
        // pagination: {
        //     pageSize: limit,
        // },
        sorters: [
            {
                field: "createdAt",
                order: "desc",
            },
        ],
        filters: [
            {
                field: "action",
                operator: "in",
                value: ["CREATE", "UPDATE"],
            },
            {
                field: "targetEntity",
                operator: "eq",
                value: "Deal",
            },
        ],
        meta: {
            gqlQuery: DASHBOARD_LATEST_ACTIVITIES_AUDITS_QUERY,
        },
    });
    const dealIds = audit?.data?.map((audit) => audit.targetId);

    //const dealIds = audit?.data?.map((audit) => audit?.targetId)
    // const { data: deals, isLoading: isLoadingDeals } = useList({
    //     resource: 'deals',
    //     queryOptions: { enabled: !!dealIds?.length },
    //     pagination: {
    //         mode: 'off'
    //     },
    //     filters: [{ field: 'id', operator: 'in', value: 'dealIds' }],
    //     meta: {
    //         gqlQuery: DASHBOARD_LATEST_ACTIVITIES_DEALS_QUERY
    //     }
    // })

    // if (isError) {
    //     console.log(error)
    //     return null;
    // }
    // const isLoading = isLoadingAudit || isLoadingDeals
    const { data: deals, isLoading: isLoadingDeals } = useList<
        GetFieldsFromList<DashboardLatestActivitiesDealsQuery>
    >({
        resource: "deals",
        queryOptions: { enabled: !!dealIds?.length },
        pagination: {
            mode: "off",
        },
        filters: [{ field: "id", operator: "in", value: dealIds }],
        meta: {
            gqlQuery: DASHBOARD_LATEST_ACTIVITIES_DEALS_QUERY,
        },
    });

    if (isError) {
        console.error("Error fetching latest activities", error);
        return null;
    }

    const isLoading = isLoadingAudit || isLoadingDeals;
    return (
        <Card
            headStyle={{ padding: '16px' }}
            bodyStyle={{ padding: '0 1rem' }}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UnorderedListOutlined />
                    <Text size='sm' style={{ marginLeft: '0.5rem' }}>
                        Latest Activities
                    </Text>
                </div>
            }
        >
            {isLoading ? (
                <List
                    itemLayout='horizontal'
                    dataSource={Array.from({ length: 5 }).map((_, i) => ({ id: i }))}
                    renderItem={(_, index) => (
                        <LatestActivitiesSkeleton key={index} />
                    )}
                />
            ) : (
                <List
                    itemLayout='horizontal'
                    dataSource={audit?.data}
                    renderItem={(item) => {
                        const deal = deals?.data.find((deal) => deal.id === String(item.targetId)) || undefined;
                        return (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={
                                        <CustomAvatar
                                            shape="square"
                                            size={48}
                                            src={deal?.company.avatarUrl}
                                            name={deal?.company.name}
                                        />
                                    }
                                    title={dayjs(deal?.createdAt).format("MMM DD, YYYY - HH:mm")}
                                    description={
                                        <Space size={4}>
                                            <Text strong>{item.user?.name}</Text>
                                            <Text>
                                                {item.action === "CREATE" ? "created" : "moved"}
                                            </Text>
                                            <Text strong>{deal?.title}</Text>
                                            <Text>deal</Text>
                                            <Text>{item.action === "CREATE" ? "in" : "to"}</Text>
                                            <Text strong>{deal?.stage?.title || "Unassigned"}.</Text>
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )
                    }}
                />
            )}
        </Card>
    )
}

export default LatestActivities