'use client';

import { useState } from 'react';
import HeaderList from './HeaderList';
import { FaTag } from 'react-icons/fa';
import { TAG_FAVS, TAG_HIDDEN } from '@/tag';
import FavsTag from '../tag/FavsTag';
import HiddenTag from '@/tag/HiddenTag';
import PhotoTag from '@/tag/PhotoTag';

const INITIAL_TAG_COUNT = 10;

export default function SidebarTags({
    tags,
}: {
    tags: { tag: string, count: number }[]
}) {
    const [expanded, setExpanded] = useState(false);

    const visibleTags = expanded ? tags : tags.slice(0, INITIAL_TAG_COUNT);
    const showMore = tags.length > INITIAL_TAG_COUNT;

    return (
        <>
            <HeaderList
                title='Tags'
                icon={<FaTag size={12} className="text-icon" />}
                items={[
                    ...visibleTags.map(({ tag, count }) => {
                        switch (tag) {
                            case TAG_FAVS:
                                return <FavsTag
                                    key={TAG_FAVS}
                                    countOnHover={count}
                                    type="icon-last"
                                    prefetch={false}
                                    contrast="low"
                                    badged
                                />;
                            case TAG_HIDDEN:
                                return <HiddenTag
                                    key={TAG_HIDDEN}
                                    countOnHover={count}
                                    type="icon-last"
                                    prefetch={false}
                                    contrast="low"
                                    badged
                                />;
                            default:
                                return <PhotoTag
                                    key={tag}
                                    tag={tag}
                                    type="text-only"
                                    countOnHover={count}
                                    prefetch={false}
                                    contrast="low"
                                    badged
                                />;
                        }
                    }),
                    ...(showMore && !expanded ? [
                        <button
                            key="show-more"
                            onClick={() => setExpanded(true)}
                            className="text-xs font-medium text-dim hover:text-main transition-colors mt-1"
                        >
                            Show {tags.length - INITIAL_TAG_COUNT} more...
                        </button>
                    ] : []),
                    ...(showMore && expanded ? [
                        <button
                            key="show-less"
                            onClick={() => setExpanded(false)}
                            className="text-xs font-medium text-dim hover:text-main transition-colors mt-1"
                        >
                            Show less
                        </button>
                    ] : [])
                ]}
            />
        </>
    );
}
