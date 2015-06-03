/* global $, ResiziveStorage */

'use strict';


$(function () {
    var storage = new ResiziveStorage();
    var $form = $('.configForm');
    var $success = $('.success');

    // get values from localStorage (with default fallbacks)
    var values = storage.getValues();

    console.log('storage values', values);

    // assign a input[type=text] field a value
    var setSelect = function (name, value) {
        $form.find('[name=' + name + ']').val(value);
    };

    // check/uncheck a checkbox based on value
    var setCheckbox = function (name, value) {
        var state = value ? true : false;
        $form.find('[name=' + name + ']').prop('checked', state);
    };

    // assign value read from local storage to each text field
    var selects = [
        'animation_increment',
        'animation_duration',
        'step_increment',
        'step_duration'
    ];
    selects.forEach(function (select) {
        setSelect(select, values[select]);
    });

    // check/uncheck each checkbox based on value from localstorage
    var checkbox_fields = [
        'scrollbars',
        'rulers',
        'snap'
    ];
    checkbox_fields.forEach(function (name) {
        setCheckbox(name, values[name]);
    });

    // on form submit, need to capture data and save to local storage
    $form.on('submit', function (event) {
        event.preventDefault();

        var $form = $(event.target);
        // go through the form and sanitize data into an object
        var data = {};

        $form.find('input, select').each(function (index) {
            var $element = $(this);
            var name = $element.attr('name');

            if ($element.attr('type') === 'checkbox') {
                // checkboxes need simply true/false based on
                // checked/unchecked status
                data[name] = $element.is(':checked');
            }

            if ($element.hasClass('integerOnly')) {
                // coerce int values into integer
                data[name] = parseInt($element.val(), 10);
            }
        });

        console.log('setting data', data);

        // save data to local storage
        storage.setValues(data);

        // show the success message, and hide it again after a few seconds
        $success.removeClass('invisible');
        setTimeout(function () {
            $success.addClass('invisible');
        }, 3000);
        return false;
    });
});

