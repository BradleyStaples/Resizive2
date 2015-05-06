class Keyboard

    body: document.body

    keys:
        left: 37
        up: 38
        right: 39
        down: 40
        e: 69
        p: 80
        r: 82
        s: 83
        '+': 107
        '-': 109
        '?': 191

    codes: {}

    methods: ['keydown', 'keyup', 'keypress']

    bindings: {
        'keydown': {}
        'keyup': {}
        'keypress': {}
    }

    isArray: (value) ->
        Array.isArray || (value) -> return {}.toString.call value is '[object Array]'

    generateCodes:  ->
        @mapCode key, code for key, code of @keys

    mapCode: (key, code) ->
        @codes[code] = key

    mapper: (method, event) ->
        code = event.keyCode
        tag = event.target.tagName.toLowerCase()
        if tag is 'input' or tag is 'textarea' then return false
        if code not of @codes then return false
        key = @codes[code]
        func = @bindings[method][key]()
        func() if @doesBindingExist key, method
            
    sanitizeMethod: (method) ->
        if method in @methods then return method else return 'keydown'

    sanitizeKeys: (keys) ->
        validKeys = for key, index in keys
            do (key) =>
                if key of @keys
                    return key


    doesBindingExist: (key, method) ->
        if method not of @bindings then return false
        return key of @bindings[method] 

    register: (key, method, func) ->
        @bindings[method][key] = func
        if document.addEventListener
            @body.addEventListener method, @mapper.bind(this, method), false
        else
            @body.addEventListener 'on' + method, @mapper.bind(this, method)
        return @bindings[method][key]

    unregister: (key, method) ->
        if document.removeEventListener
            @body.removeEventListener method, @mapper.bind(this, method), false
        else
            @body.detachEvent method, @mapper.bind(this, method)
        delete @bindings[method][key]

    unbindMethod: (method) ->
        unbind key, method for key of @keys

    bind: (keys, method, func) =>
        if not @isArray keys
            keys = [keys]
        keys = @sanitizeKeys keys
        method = @sanitizeMethod method
        for key, index in keys
            do (key) =>
                if not @doesBindingExist(key, method)
                    @register key, method, func

    unbind: (key, method) =>
        if key not of @keys then return false
        method = @sanitizeMethod method
        if not @doesBindingExist key, method then return
        @unregister key, method

    unbindAll: () =>
        @unbindMethod method for method in @methods
        
$ ->
    window.Keyboard = new Keyboard()
    window.Keyboard.generateCodes()