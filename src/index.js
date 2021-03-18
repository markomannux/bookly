import Rails from 'rails-ujs';
import Turbolinks from 'turbolinks'
import './utils/turbolinks-monkeypatch'

import DayPageController from './reservations/day'

import css from './style.css'

Rails.start();
Turbolinks.start();

new DayPageController('reservations-day')