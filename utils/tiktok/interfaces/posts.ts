export type TypeVideo = 'normal' | 'advance' | 'advanceplus';

export interface Queue {
    folderDir: string;
    folderTrashDir: string;
    postId: string;
    type: TypeVideo;
    url: string;
}