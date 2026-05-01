import {
    hasRecentContext,
    stripRecentContext,
    type RecentItemContext,
} from 'lib/components/TaxonomicFilter/recentTaxonomicFiltersLogic'
import { TaxonomicDefinitionTypes, TaxonomicFilterGroup, TaxonomicFilterGroupType, TaxonomicFilterValue } from 'lib/components/TaxonomicFilter/types'

import {
    isActorsQuery,
    isGroupsQuery,
    isSessionsQuery,
    taxonomicEventFilterToHogQL,
    taxonomicGroupFilterToHogQL,
    taxonomicPersonFilterToHogQL,
} from '~/queries/utils'
import { DataTableNode } from '~/queries/schema/schema-general'
import { extractDisplayLabel } from '../utils'

export function getRecentColumnSelectionContext(
    group: Pick<TaxonomicFilterGroup, 'name' | 'type'>,
    item: TaxonomicDefinitionTypes | null | undefined
): Pick<RecentItemContext, 'sourceGroupName' | 'sourceGroupType'> {
    if (item && hasRecentContext(item)) {
        return {
            sourceGroupType: item._recentContext.sourceGroupType,
            sourceGroupName: item._recentContext.sourceGroupName,
        }
    }

    return {
        sourceGroupType: group.type,
        sourceGroupName: group.name,
    }
}

export function buildRecentColumnSelectionItem(
    item: TaxonomicDefinitionTypes | null | undefined,
    value: TaxonomicFilterValue
): { name: string; id?: string } {
    const fallbackName = extractDisplayLabel(String(value ?? ''))

    if (!item) {
        return { name: fallbackName }
    }

    const stripped = hasRecentContext(item) ? stripRecentContext(item) : item

    return {
        name: ('name' in stripped && stripped.name) || fallbackName,
        ...(typeof stripped === 'object' && stripped && 'id' in stripped && stripped.id ? { id: stripped.id } : {}),
    }
}

export function taxonomicColumnSelectionToHogQL(
    source: DataTableNode['source'],
    groupType: TaxonomicFilterGroupType,
    value: TaxonomicFilterValue
): string | null {
    if (isGroupsQuery(source)) {
        return taxonomicGroupFilterToHogQL(groupType, value)
    }

    if (isActorsQuery(source)) {
        return taxonomicPersonFilterToHogQL(groupType, value)
    }

    if (isSessionsQuery(source)) {
        return taxonomicEventFilterToHogQL(groupType, value)
    }

    return taxonomicEventFilterToHogQL(groupType, value)
}
