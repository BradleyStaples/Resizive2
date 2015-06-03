/* global $, ResiziveStorage */

'use strict';


$(function () {
    var storage = new ResiziveStorage();
    var $form = $('.configForm');
    var $success = $('.success');

    // get values from localStorage (with default fallbacks)
    var values = storage.getValues();

    // assign a input[type=text] field a value
    var setText = function (name, value) {
        $form.find('[name=' + name + ']').val(value);
    };

    // check/uncheck a checkbox based on value
    var setCheckbox = function (name, value) {
        var state = value ? true : false;
        $form.find('[name=' + name + ']').prop('checked', state);
    };

    // assign value read from local storage to each text field
    var text_fields = [
        'increment',
        'duration',
        'stepincrement',
        'stepduration'
    ];
    text_fields.forEach(function (name) {
        setText(name, values[name]);
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

        // go through the form and sanitize data into an object
        var data = {};
        $(event.target).find('input').each(function (index) {
            var $input = $(this);

            if ($input.attr('type') === 'text') {
                var val = $input.val();

                if ($input.hasClass('integerOnly')) {
                    // coerce int values into integer
                    val = parseInt(val, 10);
                }
                data[$input.attr('name')] = val;
            } else if ($input.attr('type') === 'checkbox') {
                // checkboxes need simply true/false based on
                // checked/unchecked status
                data[$input.attr('name')] = $input.is(':checked');
            }
        });

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

