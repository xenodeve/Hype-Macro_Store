// นิยามประเภทข้อมูล
export interface Theme {
    value: string;
}

export interface YouTubeMessageData {
    event?: string;
    info?: {
        playerState?: number;
    };
}

// Interface สำหรับจัดการ Group Hover Behavior
export interface HoverGroup {
    element: HTMLElement;
    isHovered: boolean;
    priority: number;
}

export interface HoverManager {
    groups: Map<string, HoverGroup>;
    conflictingGroups: string[][];
}
