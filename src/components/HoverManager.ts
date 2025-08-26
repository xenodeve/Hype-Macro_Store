import type { HoverGroup, HoverManager } from '../types/index.js';

/**
 * คลาสสำหรับจัดการ hover behavior ระหว่างกลุ่มต่างๆ
 * ถ้า group1 และ group3 hover พร้อมกัน จะปิดการใช้งาน hover ของ group1
 */
class GroupHoverManager implements HoverManager {
    groups: Map<string, HoverGroup> = new Map();
    conflictingGroups: string[][] = [['group1', 'group3']];
    private isInitialized = false;

    constructor() {
        this.initializeGroups();
    }

    /**
     * เริ่มต้นการจัดการกลุ่ม
     */
    private initializeGroups(): void {
        // ค้นหา elements ที่มี class group1, group2, group3
        const group1Elements = document.querySelectorAll('.group1');
        const group3Elements = document.querySelectorAll('.group3');

        // สร้าง hover groups
        this.createHoverGroup('group1', group1Elements, 1); // priority ต่ำกว่า
        this.createHoverGroup('group3', group3Elements, 2); // priority สูงกว่า

        this.isInitialized = true;
        console.log('🎯 HoverManager initialized successfully');
    }

    /**
     * สร้าง hover group สำหรับ elements
     */
    private createHoverGroup(groupName: string, elements: NodeListOf<Element>, priority: number): void {
        elements.forEach((element, index) => {
            const htmlElement = element as HTMLElement;
            const groupKey = `${groupName}-${index}`;
            
            const hoverGroup: HoverGroup = {
                element: htmlElement,
                isHovered: false,
                priority
            };

            this.groups.set(groupKey, hoverGroup);
            this.attachHoverListeners(groupKey, hoverGroup);
        });
    }

    /**
     * ติด event listeners สำหรับ hover
     */
    private attachHoverListeners(groupKey: string, hoverGroup: HoverGroup): void {
        const { element } = hoverGroup;

        // Mouse enter event
        element.addEventListener('mouseenter', () => {
            this.handleMouseEnter(groupKey);
        });

        // Mouse leave event
        element.addEventListener('mouseleave', () => {
            this.handleMouseLeave(groupKey);
        });
    }

    /**
     * จัดการเมื่อเมาส์เข้า element
     */
    private handleMouseEnter(groupKey: string): void {
        const hoverGroup = this.groups.get(groupKey);
        if (!hoverGroup) return;

        hoverGroup.isHovered = true;

        // ตรวจสอบว่ามี conflict กับกลุ่มอื่นหรือไม่
        this.checkAndResolveConflicts();
    }

    /**
     * จัดการเมื่อเมาส์ออกจาก element
     */
    private handleMouseLeave(groupKey: string): void {
        const hoverGroup = this.groups.get(groupKey);
        if (!hoverGroup) return;

        hoverGroup.isHovered = false;

        // คืนสถานะ hover ให้กลุ่มที่ถูกปิดการใช้งาน
        this.restoreDisabledHovers();
    }

    /**
     * ตรวจสอบและแก้ไข conflicts ระหว่างกลุ่ม
     */
    private checkAndResolveConflicts(): void {
        this.conflictingGroups.forEach(conflictPair => {
            const group1Hovered = this.isGroupHovered(conflictPair[0]);
            const group3Hovered = this.isGroupHovered(conflictPair[1]);

            // ถ้า group1 และ group3 hover พร้อมกัน
            if (group1Hovered && group3Hovered) {
                console.log('⚠️ Conflict detected: group1 and group3 both hovered');
                
                // ปิดการใช้งาน hover ของ group1 (priority ต่ำกว่า)
                this.disableGroupHover(conflictPair[0]);
                
                // เพิ่ม visual indicator
                this.addConflictIndicator(conflictPair[0]);
            }
        });
    }

    /**
     * คืนสถานะ hover ที่ถูกปิดการใช้งาน
     */
    private restoreDisabledHovers(): void {
        this.conflictingGroups.forEach(conflictPair => {
            const group1Hovered = this.isGroupHovered(conflictPair[0]);
            const group3Hovered = this.isGroupHovered(conflictPair[1]);

            // ถ้าไม่มี conflict แล้ว คืนสถานะ hover
            if (!group1Hovered || !group3Hovered) {
                this.enableGroupHover(conflictPair[0]);
                this.removeConflictIndicator(conflictPair[0]);
            }
        });
    }

    /**
     * ตรวจสอบว่ากลุ่มใดกลุ่มหนึ่งกำลัง hover อยู่หรือไม่
     */
    private isGroupHovered(groupName: string): boolean {
        for (const [key, hoverGroup] of this.groups) {
            if (key.startsWith(groupName) && hoverGroup.isHovered) {
                return true;
            }
        }
        return false;
    }

    /**
     * ปิดการใช้งาน hover ของกลุ่ม
     */
    private disableGroupHover(groupName: string): void {
        for (const [key, hoverGroup] of this.groups) {
            if (key.startsWith(groupName)) {
                hoverGroup.element.classList.add('hover-disabled');
                hoverGroup.element.style.pointerEvents = 'none';
            }
        }
    }

    /**
     * เปิดการใช้งาน hover ของกลุ่ม
     */
    private enableGroupHover(groupName: string): void {
        for (const [key, hoverGroup] of this.groups) {
            if (key.startsWith(groupName)) {
                hoverGroup.element.classList.remove('hover-disabled');
                hoverGroup.element.style.pointerEvents = 'auto';
            }
        }
    }

    /**
     * เพิ่ม visual indicator เมื่อเกิด conflict
     */
    private addConflictIndicator(groupName: string): void {
        for (const [key, hoverGroup] of this.groups) {
            if (key.startsWith(groupName)) {
                hoverGroup.element.classList.add('hover-conflict');
                
                // เพิ่ม temporary notification
                this.showConflictNotification(hoverGroup.element);
            }
        }
    }

    /**
     * ลบ visual indicator
     */
    private removeConflictIndicator(groupName: string): void {
        for (const [key, hoverGroup] of this.groups) {
            if (key.startsWith(groupName)) {
                hoverGroup.element.classList.remove('hover-conflict');
            }
        }
    }

    /**
     * แสดง notification เมื่อเกิด conflict
     */
    private showConflictNotification(element: HTMLElement): void {
        // สร้าง notification element
        const notification = document.createElement('div');
        notification.className = 'hover-conflict-notification';
        notification.textContent = 'Hover disabled due to group conflict';
        notification.style.cssText = `
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1000;
            pointer-events: none;
            animation: fadeInOut 2s ease-in-out;
        `;

        // เพิ่ม CSS animation
        if (!document.querySelector('#hover-conflict-styles')) {
            const style = document.createElement('style');
            style.id = 'hover-conflict-styles';
            style.textContent = `
                @keyframes fadeInOut {
                    0%, 100% { opacity: 0; transform: translateX(-50%) translateY(10px); }
                    20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
                
                .hover-disabled {
                    opacity: 0.5 !important;
                    filter: grayscale(50%) !important;
                    transition: all 0.3s ease !important;
                }
                
                .hover-conflict {
                    position: relative;
                    border: 2px dashed rgba(255, 0, 0, 0.5) !important;
                }
            `;
            document.head.appendChild(style);
        }

        // เพิ่ม notification ให้ element
        element.style.position = 'relative';
        element.appendChild(notification);

        // ลบ notification หลังจาก 2 วินาที
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 2000);
    }

    /**
     * รีเซ็ตสถานะทั้งหมด
     */
    public resetAllStates(): void {
        for (const [, hoverGroup] of this.groups) {
            hoverGroup.isHovered = false;
            hoverGroup.element.classList.remove('hover-disabled', 'hover-conflict');
            hoverGroup.element.style.pointerEvents = 'auto';
        }
        console.log('🔄 All hover states reset');
    }

    /**
     * ดูสถานะปัจจุบันของทุกกลุ่ม (สำหรับ debugging)
     */
    public getGroupStates(): Record<string, boolean> {
        const states: Record<string, boolean> = {};
        for (const [key, hoverGroup] of this.groups) {
            states[key] = hoverGroup.isHovered;
        }
        return states;
    }

    /**
     * ตรวจสอบว่าระบบทำงานพร้อมหรือยัง
     */
    public isReady(): boolean {
        return this.isInitialized && this.groups.size > 0;
    }
}

// สร้าง instance เดียว (Singleton pattern)
let hoverManagerInstance: GroupHoverManager | null = null;

/**
 * เริ่มต้นระบบจัดการ group hover
 */
export function initializeHoverManager(): GroupHoverManager {
    if (!hoverManagerInstance) {
        hoverManagerInstance = new GroupHoverManager();
        console.log('🎯 GroupHoverManager initialized');
    }
    return hoverManagerInstance;
}

/**
 * ได้รับ instance ปัจจุบันของ hover manager
 */
export function getHoverManager(): GroupHoverManager | null {
    return hoverManagerInstance;
}

/**
 * รีเซ็ตระบบ hover manager
 */
export function resetHoverManager(): void {
    if (hoverManagerInstance) {
        hoverManagerInstance.resetAllStates();
        hoverManagerInstance = null;
        console.log('🔄 HoverManager reset');
    }
}

export default GroupHoverManager;
