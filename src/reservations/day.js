import PageController from '../common/page-controller'
import Rails from 'rails-ujs'

export default class DayPageController extends PageController {

    setUp() {
        const links = document.querySelectorAll('a[data-behavior=show-others-link]')
        for (let link of links) {
            link.addEventListener('click', event => {
                event.preventDefault()
                console.log('link clicked');
                document.querySelector('#colleague input[name=room]').value = event.target.dataset.room
                this.toggleModal()
            })
        }

        const people = document.querySelectorAll('[data-behavior=book-for-colleague]')
        for (let person of people) {
            person.addEventListener('click', event => {
                console.log('colleague clicked', event.target.dataset.employee);
                document.querySelector('#colleague input[name=employee]').value = event.target.dataset.employee
                Rails.fire(document.getElementById('colleague'), 'submit')
            })
        }

        const overlay = document.querySelector('.modal-overlay')
        overlay.addEventListener('click', () => this.clearModal())
        
        var closemodal = document.querySelectorAll('.modal-close')
        for (var i = 0; i < closemodal.length; i++) {
        closemodal[i].addEventListener('click', () => this.clearModal())
        }

        document.onkeydown = function(evt) {
            evt = evt || window.event
            var isEscape = false
            if ("key" in evt) {
                isEscape = (evt.key === "Escape" || evt.key === "Esc")
            } else {
                isEscape = (evt.keyCode === 27)
            }
            if (isEscape && document.body.classList.contains('modal-active')) {
                this.clearModal()
            }
        };
    }

    toggleModal () {         
      const body = document.querySelector('body')
      const modal = document.querySelector('.modal')
      modal.classList.toggle('opacity-0')
      modal.classList.toggle('pointer-events-none')
      body.classList.toggle('modal-active')
    }

    clearForm() {
        document.querySelector('#colleague input[name=room]').value = ''
        document.querySelector('#colleague input[name=employee]').value = ''
    }

    clearModal() {
        this.toggleModal()
        this.clearForm()
    }
}