'use strict';
const global = Function('return this;')();
global.jQuery = $;
import bootstrap from 'bootstrap';
import $ from 'jquery';

const url = $(location).attr('href');
$('#current-url').val(url);

$('.availability-toggle-button').each((i, e) => {
  const button = $(e);
  button.on('click', () => {
    const scheduleId = button.data('schedule-id');
    const userId = button.data('user-id');
    const dateId = button.data('date-id');
    const availability = parseInt(button.data('availability'));
    const nextAvailability = (availability + 1) % 3;

    $.post(
      `/schedules/${scheduleId}/users/${userId}/dates/${dateId}`,
      { availability: nextAvailability },
      data => {
        button.data('availability', data.availability);
        const availabilityLabels = ['×', '?', '✓'];
        button.text(availabilityLabels[data.availability]);

        const buttonStyles = ['btn-danger', 'btn-secondary', 'btn-success'];
        button.removeClass('btn-danger btn-secondary btn-success');
        button.addClass(buttonStyles[data.availability]);
      }
    );
  });
});