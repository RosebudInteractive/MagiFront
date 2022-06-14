import { getAllLessons } from '#src/ducks/dictionary';
import { setInitState } from '#src/ducks/route';
declare const _default: import("react-redux").ConnectedComponent<({ lessons, images, actions }: {
    lessons: any;
    fetching: boolean;
    images: import("../../@types/images").ImageInfo[] | null;
} & {
    actions: {
        getAllLessons: typeof getAllLessons;
        getImages: (options: {
            lessonId?: number | undefined;
            taskId?: number | undefined;
        }) => {
            type: string;
            payload: {
                lessonId?: number | undefined;
                taskId?: number | undefined;
            };
        };
        setInitState: typeof setInitState;
    };
}) => JSX.Element, import("react-redux").Omit<{
    lessons: any;
    fetching: boolean;
    images: import("../../@types/images").ImageInfo[] | null;
} & {
    actions: {
        getAllLessons: typeof getAllLessons;
        getImages: (options: {
            lessonId?: number | undefined;
            taskId?: number | undefined;
        }) => {
            type: string;
            payload: {
                lessonId?: number | undefined;
                taskId?: number | undefined;
            };
        };
        setInitState: typeof setInitState;
    };
}, "images" | "lessons" | "actions" | "fetching">>;
export default _default;
//# sourceMappingURL=index.d.ts.map