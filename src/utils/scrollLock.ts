export const scrollState = {
    isProgrammaticScroll: false,
    timeoutId: null as ReturnType<typeof setTimeout> | null
};

export const setProgrammaticScroll = (isScrolling: boolean, duration = 1000) => {
    scrollState.isProgrammaticScroll = isScrolling;

    if (scrollState.timeoutId) {
        clearTimeout(scrollState.timeoutId);
        scrollState.timeoutId = null;
    }

    if (isScrolling) {
        scrollState.timeoutId = setTimeout(() => {
            scrollState.isProgrammaticScroll = false;
        }, duration);
    }
};
