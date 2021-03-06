export default class PageController {

    constructor(pageName) {
        this.pageName = pageName;
        document.addEventListener('turbolinks:load', () => {
            const page = document.querySelector('meta[name=page]').getAttribute('content')
            if (page === this.pageName) {
                this.setUp()
            }
        })

        document.addEventListener('turbolinks:before-cache', () => {
            this.beforeCache();
        })

        document.addEventListener('turbolinks:before-render', () => {
            this.tearDown();
        })
    }

    setUp() {
        console.log(`Setting up ${this.pageName}`)
    }

    beforeCache() {
        console.log(`Before caching ${this.pageName}`)
    }

    tearDown() {
        console.log(`Tearing down ${this.pageName}`)
    }
}