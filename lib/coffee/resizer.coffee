# Todo: minimize elements needed by using 'states' classes (resizing, paused, etc)
# Todo: validate URL before starting.
# Todo: add animation speed as option
# Todo: support px and em
# Todo: pretty it up, restructure styles
# Todo: draggable edge
# Todo: prebuilt styles
# Todo: chrome extension?
# Todo: icon font for symbols? font squirrel, etc
# Todo: better url management. urls for about/confg ?
# Todo: refresh shenanigans causing starts
# Todo: keyboard shortcuts going crazy when not on animating page.
# Todo: give height options/restrictions ?
# Todo: question mark shows keyboard shotcut menu - http://www.impressivewebs.com/questionmark-js-shortcut-keys-displayed/

class Resizive

    elementSelectors:
        templateLinks: 'a[data-template]'
        render: '.render'
        loadButton: '.btn-load'
        startButton: '.btn-start'
        endButton: '.btn-end'
        pauseButton: '.btn-pause'
        resumeButton: '.btn-resume'
        minusButton: '.btn-minus'
        plusButton: '.btn-plus'
        helpButton: '.button-help'
        showWidth: '.show-width'
        resizer: '.resizer'
        header: '.header'
        url: '.url-entry'
        img: '.loading'
        body: 'body'

    elements: {}

    data:
        templates: []
        url: null
        timer: null
        paused: false
        resizing: false
        classResize: 'resizing'
        classPause: 'paused'
        enterKey: 13
        direction: -1
        stepDuration: 50
        stepIncrememnt: 10
        animationDuration: 100
        animationIncrement: 50
        minWidth: 320
        currWidth: $(window).width()
        maxWidth: $(window).width()

    constructor:  ->
        @assignElements()
        @parseTemplates()
        @setBindings()
        query = @parseQueryString()
        if query
            @render 'animating'
            @start query
        else
            @render 'home', {url: ''}

        @verticalDragger = new Dragdealer('resize-control.vertical', {
            horizontal: false
            vertical: true
        });

        @horizontalDragger = new Dragdealer('resize-control.horizontal', {
            horizontal: true
            vertical: false
        });

    assignElements: ->
        for element, selector of @elementSelectors
            @elements[element] = $ selector if not @elements[element] or not @elements[element].length

    parseTemplates: ->
        templates = [
            'animating-template'
            'home-template'
            'about-template'
            'config-template'
        ]
        @parseTemplate template for template in templates

    parseTemplate: (t) ->
        $t = $ '#' + t
        @data.templates[t] = window.Hogan.compile($t.html())

    render: (template, context, bodyClass) ->
        template = template + '-template'
        contents = @data.templates[template].render(context)
        @elements.render.html contents
        if bodyClass then @elements.body.removeClass().addClass bodyClass
        @assignElements()

    setBindings: ->
        $(window).resize => @updateMaxWidth
        @elements.body.on 'click', @elementSelectors.templateLinks, (event) =>
            event.preventDefault()
            $t = $ event.target
            bodyClass = $t.data('class')
            template = $t.data('template')
            @render template, {}, bodyClass
        @elements.body.on 'click', @elementSelectors.loadButton, => @load()
        @elements.body.on 'click', @elementSelectors.startButton, => @start()
        @elements.body.on 'click', @elementSelectors.endButton, => @end()
        @elements.body.on 'click', @elementSelectors.pauseButton, => @pause()
        @elements.body.on 'click', @elementSelectors.resumeButton, => @resume()
        @elements.body.on 'click', @elementSelectors.plusButton, => @plus()
        @elements.body.on 'click', @elementSelectors.minusButton, => @minus()
        @elements.body.on 'keydown', @elementSelectors.url, (e) =>
            e.stopPropagation()
             # pass explicit false to show no query data and avoid auto
            @start false if e.which is @data.enterKeypause
        @elements.body.on 'blur', @elementSelectors.showWidth, =>
            @setWidth()
        @elements.body.on 'keydown', @elementSelectors.showWidth, (e) =>
            e.stopPropagation()
            if e.which is @data.enterKey
                # prevent carriage return with preventDefault
                e.preventDefault()
                @elements.showWidth.blur()
        @setKeyBindings()

    setKeyBindings: ->
        @k ?= window.Keyboard;
        @k.bind 's', 'keydown', => @start.bind @
        @k.bind 'e', 'keydown', => @end.bind @
        @k.bind 'p', 'keydown', => @pause.bind @
        @k.bind 'r', 'keydown', => @resume.bind @
        @k.bind ['down', 'left', '-'], 'keydown', => @minus.bind @
        @k.bind ['up', 'right', '+'], 'keydown', => @plus.bind @

    parseQueryString: ->
        params = @getQueryString()
        if params.hasOwnProperty('url') and params.hasOwnProperty('width')
            if params.url isnt '' and not isNaN(params.width)
                @elements.url.val params.url
                @data.currWidth = parseInt(params.width, 10)
                @elements.showWidth.text(params.width + 'px').blur()
            return true
        false

    getQueryString: ->
        result = {}
        queryString = window.location.hash.toString().substring(1)
        regex = /([^&=]+)=([^&]*)/g
        matches = undefined
        # while the regex finds matches in a xxx=yyy format, it splits & parses them up
        matches = regex.exec(queryString)
        while matches
            # also decodes them in case they are URI encoded
            result[decodeURIComponent(matches[1])] = decodeURIComponent(matches[2])
            matches = regex.exec(queryString)
        @data.url = result.url;
        result

    load: () ->
        @elements.body.addClass @data.classResize
        @elements.img.removeClass 'hidden'
        @data.url = @data.url || @elements.url.val()
        @data.url = 'http://' + @data.url if @data.url.indexOf('://') is -1
        @render('animating', {url: @data.url})
        $(@elementSelectors.resizer).one 'load', =>
            @elements.img.addClass 'hidden'
            $('.resizer').removeClass('hidden').css
                'height': 640
                'width': 320
            @keepInBounds false
            @animator @data.animationDuration
            @pause()
        @data.paused = true
        @data.resizing = false

    start: (queryLoad) ->
        @elements.body.addClass @data.classResize
        @elements.img.removeClass 'hidden'
        @data.url = @data.url || @elements.url.val()
        @data.url = 'http://' + @data.url if @data.url.indexOf('://') is -1
        @render('animating', {url: @data.url})
        $(@elementSelectors.resizer).one 'load', =>
            @elements.img.addClass 'hidden'
            $('.resizer').removeClass('hidden').css
                'height': $(window).height()
            if queryLoad is true
                @keepInBounds false
                @animator @data.animationDuration
                @pause()
            else
                @data.timer = setInterval(=>
                    @resize 'animationDuration', 'animationIncrement'
                , @data.animationDuration)
        @data.paused = false
        @data.resizing = true

    end: ->
        mw = @data.maxWidth
        @elements.body.removeClass @data.classResize
        clearInterval @data.timer
        @elements.body.stop true, true
        @elements.img.addClass 'hidden'
        $(@elementSelectors.resizer).remove()
        @elements.body.removeClass @data.classPause
        # reset the direction
        @data.direction = -1
        # reset the width back to the current max viewport size for currWidth and actual body/header elements
        @render('home', {url: @data.url})
        @data.url = null
        @data.currWidth = mw
        @elements.body.width mw
        @elements.header.width mw
        @elements.showWidth.text mw + 'px'
        window.location.hash = ''
        @data.paused = false
        @data.resizing = false

    animator: (duration) ->
        @elements.body.animate
            width: @data.currWidth
        , duration, =>
            @elements.showWidth.text @data.currWidth + 'px'

        window.location.hash = '#url=' + encodeURIComponent(@elements.url.val()) + '&width=' + encodeURIComponent(@data.currWidth)


    keepInBounds: (reset) ->
        if @data.currWidth > @data.maxWidth
            @data.currWidth = @data.maxWidth
            @data.direction *= -1 if reset
        else if @data.currWidth < @data.minWidth
            @data.currWidth = @data.minWidth
            @data.direction *= -1 if reset

    minus: ->
        @updateDirection -1
        @resize 'stepDuration', 'stepIncrememnt'

    pause: ->
        @elements.body.addClass(@data.classPause).stop true, true
        clearInterval @data.timer
        @updateWidth @elements.body.width()
        @data.paused = true

    plus: ->
        @updateDirection +1
        @resize 'stepDuration', 'stepIncrememnt'

    resize: (durationType, sizeType) ->
        adjustment = @data[sizeType]
        duration = @data[durationType]
        reset = (if (durationType is 'stepDuration') then false else true)
        startingWidth = @data.currWidth
        @data.currWidth = @data.currWidth + (adjustment * @data.direction)
        @keepInBounds reset
        @animator duration if startingWidth isnt @data.currWidth

    resume: ->
        @elements.body.removeClass(@data.classPause).stop true, true
        @data.timer = setInterval(=>
            @resize 'animationDuration', 'animationIncrement'
        , @data.animationDuration)
        @data.paused = false

    setWidth: ->
        px = @elements.showWidth.text().replace(' ', '').replace('px', '').replace('em', '')
        startingWidth = @data.currWidth
        if isNaN(px)
            @elements.showWidth.text @data.currWidth + 'px'
            return
        @data.currWidth = parseInt(px, 10)
        if @data.currWidth < startingWidth
            @updateDirection -1
        else
            @updateDirection +1
        @keepInBounds false
        @animator @data.animationDuration if startingWidth isnt @data.currWidth

    updateDirection: (dir) ->
        @data.direction = dir

    updateMaxWidth: ->
        @data.max = $(window).width()

    updateWidth: (w) ->
        @data.currWidth = w
        @elements.showWidth.text @data.currWidth + 'px'

$ ->
    window.resizive = new Resizive
