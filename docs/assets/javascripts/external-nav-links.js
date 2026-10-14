// Open links to external navigation destinations (e.g. the OpenAPI Spec tab) in a new tab,
// since navigating away from the docs site entirely without warning is poor UX.
// document$ (not DOMContentLoaded) since navigation.instant skips a full reload.
document$.subscribe(function () {
    document.querySelectorAll('.md-tabs__link, .md-nav__link').forEach(function (link) {
        if (link.hostname && link.hostname !== location.hostname) {
            link.target = '_blank';
            link.rel = 'noopener';
        }
    });
});
