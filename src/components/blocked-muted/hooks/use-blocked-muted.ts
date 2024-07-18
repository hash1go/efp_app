import { useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { FETCH_LIMIT_PARAM } from '#/lib/constants'
import fetchFollowerTags from '#/api/fetchFollowerTags'
import fetchFollowingTags from '#/api/fetchFollowingTags'
import type { ProfileTableTitleType } from '#/types/common'
import fetchProfileFollowers from '#/api/fetchProfileFollowers'
import fetchProfileFollowing from '#/api/fetchProfileFollowing'
import type { FollowerResponse, FollowingResponse, FollowSortType } from '#/types/requests'

export const TAGS = ['All', 'block', 'mute']
export const EMPTY_COUNT_TAGS = [
  { tag: 'block', count: 0 },
  { tag: 'mute', count: 0 }
]
export const QUERY_BLOCK_TAGS = ['block', 'mute']

const useBlockedMuted = (user: string, list?: string | number) => {
  const [blockingTagsFilter, setBlockingTagsFilter] = useState<string[]>(['All'])
  const [blockedByTagsFilter, setBlockedByTagsFilter] = useState<string[]>(['All'])
  const [blockingSort, setBlockingSort] = useState<FollowSortType>('latest first')
  const [blockedBySort, setBlockedBySort] = useState<FollowSortType>('latest first')

  const {
    data: blockedByTags,
    isLoading: blockedByTagsLoading,
    isRefetching: blockedByTagsRefetching
  } = useQuery({
    queryKey: ['follower tags', user, list],
    queryFn: async () => {
      if (!user) return

      const fetchedTags = await fetchFollowerTags(user, list)
      return fetchedTags
    },
    staleTime: 30000
  })

  const {
    data: fetchedBlockedBy,
    isLoading: blockedByIsLoading,
    isRefetching: blockedByIsRefetching,
    fetchNextPage: fetchMoreBlockedBy,
    isFetchingNextPage: isFetchingMoreBlockedBy
  } = useInfiniteQuery({
    queryKey: ['followers', user, list, blockedBySort, blockedByTagsFilter],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user)
        return {
          followers: [],
          nextPageParam: pageParam
        }

      const fetchedBlockedBy = await fetchProfileFollowers({
        addressOrName: user,
        list,
        sort: blockedBySort,
        tags: blockedByTagsFilter.includes('All') ? QUERY_BLOCK_TAGS : blockedByTagsFilter,
        limit: FETCH_LIMIT_PARAM,
        pageParam,
        allResults: true
      })
      return fetchedBlockedBy
    },
    initialPageParam: 0,
    getNextPageParam: lastPage => lastPage.nextPageParam,
    staleTime: 30000
  })

  const {
    data: blockingTags,
    isLoading: blockingTagsLoading,
    isRefetching: blockingTagsRefetching
  } = useQuery({
    queryKey: ['following tags', user, list],
    queryFn: async () => {
      if (!user) return

      const fetchedTags = await fetchFollowingTags(user, list)
      return fetchedTags
    },
    staleTime: 30000
  })

  const {
    data: fetchedBlocking,
    isLoading: blockingIsLoading,
    isRefetching: blockingIsRefetching,
    fetchNextPage: fetchMoreBlocking,
    isFetchingNextPage: isFetchingMoreBlocking
  } = useInfiniteQuery({
    queryKey: ['following', user, list, blockingSort, blockingTagsFilter],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user)
        return {
          following: [],
          nextPageParam: pageParam
        }

      const fetchedBlockedBy = await fetchProfileFollowing({
        addressOrName: user,
        list,
        sort: blockingSort,
        tags: blockingTagsFilter.includes('All') ? QUERY_BLOCK_TAGS : blockingTagsFilter,
        limit: FETCH_LIMIT_PARAM,
        pageParam,
        allResults: true
      })
      return fetchedBlockedBy
    },
    initialPageParam: 0,
    getNextPageParam: lastPage => lastPage.nextPageParam,
    staleTime: 30000
  })

  const blockedBy = fetchedBlockedBy
    ? fetchedBlockedBy.pages.reduce(
        (acc, el) => [...acc, ...el.followers],
        [] as FollowerResponse[]
      )
    : []

  const blocking = fetchedBlocking
    ? fetchedBlocking.pages.reduce(
        (acc, el) => [...acc, ...el.following],
        [] as FollowingResponse[]
      )
    : []

  const toggleTag = (tab: ProfileTableTitleType, tag: string) => {
    if (tab === 'Blocked/Muted') setBlockingTagsFilter([tag])
    if (tab === 'Blocked/Muted By') setBlockedByTagsFilter([tag])
  }

  return {
    blocking,
    blockedBy,
    blockingTags,
    blockedByTags,
    blockedByIsLoading: blockedByIsLoading || blockedByIsRefetching,
    blockingIsLoading: blockingIsLoading || blockingIsRefetching,
    blockingTagsLoading: blockingTagsLoading || blockingTagsRefetching,
    blockedByTagsLoading: blockedByTagsLoading || blockedByTagsRefetching,
    fetchMoreBlockedBy,
    fetchMoreBlocking,
    isFetchingMoreBlockedBy,
    isFetchingMoreBlocking,
    blockingTagsFilter,
    blockedByTagsFilter,
    blockingSort,
    setBlockingSort,
    blockedBySort,
    setBlockedBySort,
    toggleTag
  }
}

export default useBlockedMuted
