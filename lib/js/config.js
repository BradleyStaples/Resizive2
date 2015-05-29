/* global $, resiziveStorage */

'use strict';


$(function () {

    var setText = function (key, values) {
        $('.configForm [name=' + key +']').val(values[key]);
    };

    var setCheckbox = function (key, values) {
        if (values[key]) {
            $('.configForm [name=' + key +']').prop('checked', true);
        }
    };

    // read values from localStorage / defaults
    var values = resiziveStorage.getValues();
    ['increment', 'duration', 'stepincrement', 'stepduration'].forEach(function (name) {
        setText(name, values);
    });
    ['scrollbars', 'rulers', 'snap'].forEach(function (name) {
        setCheckbox(name, values);
    });

    $('.configForm').on('submit', function (event) {
        event.preventDefault();

        // go through the form and sanitize data into an object
        var data = {};
        $(event.target).find('input').each(function (index) {
            var $input = $(this);
            if ($input.attr('type') === 'text') {
                var val = $input.val();
                if ($input.hasClass('integer-only')) {
                    val = parseInt(val, 10);
                }
                data[$input.attr('name')] = val;
            } else if ($input.attr('type') === 'checkbox') {
                data[$input.attr('name')] = $input.is(':checked');
            }
        });
        // save each object property to localStorage
        resiziveStorage.setValues(data);

        $('.succes').removeClass('invisible');
        setTimeout(function () {
            $('.succes').addClass('invisible');
        }, 3000);
        return false;
    });
});

