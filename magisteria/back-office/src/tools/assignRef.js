export default function assignRef(...refs) {
    return (ref) => {
        refs.forEach((someRef) => {
            if (!someRef)
                return;
            if (typeof someRef === 'function') {
                someRef(ref);
            }
            else {
                // eslint-disable-next-line no-param-reassign
                someRef.current = ref;
            }
        });
    };
}
