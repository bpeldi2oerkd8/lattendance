'use strict';
const global = Function('return this;')();
global.jQuery = $;
import bootstrap from 'bootstrap';
import $ from 'jquery';

//navbar固定時の開始位置下げ
$(window).on('load resize', () => {
  const height = $('.navbar').height();
  $('body').css('padding-top', height*1.5);
});

//現在位置のURL
const url = $(location).attr('href');
$('#current-url').val(url);

//コピーボタン
const copyButton = $('#copy-button');
copyButton.on('click', () => {
  $('.copy-value').trigger('select');
  document.execCommand('copy');
  copyButton.text('Copied!');
  copyButton.attr('disabled', true);
  copyButton.removeClass('btn-outline-secondary');
  copyButton.addClass('btn-secondary');
});

//出欠ボタン
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
        const availabilityLabels = ['fa-times', 'fa-question', 'fa-check'];
        
        //iconの変更
        const icon = button.children('i');
        icon.removeClass('fa-times fa-question fa-check');
        icon.addClass(availabilityLabels[data.availability]);

        //ボタンの色変更
        const buttonStyles = ['btn-danger', 'btn-secondary', 'btn-success'];
        button.removeClass('btn-danger btn-secondary btn-success');
        button.addClass(buttonStyles[data.availability]);
      }
    );
  });
});