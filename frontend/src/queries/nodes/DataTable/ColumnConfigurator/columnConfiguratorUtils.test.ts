import { TaxonomicFilterGroupType } from 'lib/components/TaxonomicFilter/types'

import { NodeKind } from '~/queries/schema/schema-general'

import {
    buildRecentColumnSelectionItem,
    getRecentColumnSelectionContext,
    taxonomicColumnSelectionToHogQL,
} from './columnConfiguratorUtils'

describe('columnConfiguratorUtils', () => {
    it('resolves recent selections back to their original source group', () => {
        const result = getRecentColumnSelectionContext(
            { name: 'Recent', type: TaxonomicFilterGroupType.RecentFilters },
            {
                name: 'email',
                _recentContext: {
                    sourceGroupType: TaxonomicFilterGroupType.PersonProperties,
                    sourceGroupName: 'Person properties',
                },
            } as any
        )

        expect(result).toEqual({
            sourceGroupType: TaxonomicFilterGroupType.PersonProperties,
            sourceGroupName: 'Person properties',
        })
    })

    it('builds a stable recent item for hogql expressions without backing ids', () => {
        expect(buildRecentColumnSelectionItem(undefined, "formatDateTime(timestamp, '%b %d') AS Time")).toEqual({
            name: 'Time',
        })
    })

    it('converts recent person-property selections using the original source group type', () => {
        const column = taxonomicColumnSelectionToHogQL(
            { kind: NodeKind.EventsQuery, select: ['*'] } as any,
            TaxonomicFilterGroupType.PersonProperties,
            'email'
        )

        expect(column).toBe('person.properties.email')
    })
})
