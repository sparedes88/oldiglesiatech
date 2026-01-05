(function() {
    var scriptEl = document.createElement('script');
    scriptEl.type = 'text/javascript';
    scriptEl.async = true;
    console.log(window.rconfWar);
    scriptEl.src = './editor/scripts/util.js';
    console.log(scriptEl)
    var scriptToAppendBefore = document.getElementsByTagName('script')[0];
    scriptToAppendBefore.parentNode.insertBefore(scriptEl, scriptToAppendBefore);
})();

function hideLoading() {
    var loading = jQuery('#editor-loading');
    if (loading != null) {
        loading.css('display', 'none');
    }
}

function replaceAll(Source, stringToFind, stringToReplace) {
    var temp = Source;
    var index = temp.indexOf(stringToFind);
    while (index != -1) {
        temp = temp.replace(stringToFind, stringToReplace);
        index = temp.indexOf(stringToFind);
    }
    return temp;
}

function setTempCss(css, styleTagId = 'tempCss') {
    var newStyle = document.createElement('style');
    newStyle.type = 'text/css';
    jQuery(newStyle).html(css);
    jQuery(newStyle).attr('id', styleTagId);
    jQuery('head').append(newStyle);
}

function isIE() {
    if (navigator.userAgent.indexOf('MSIE') != -1) {
        // Using IE
        return true;
    } else {
        return false;
    }
}

function wpGetStyleSheet() {
    return _dmGetStyleSheet('globalCss');
}

function wpGetThemeStyleSheet() {
    return _dmGetStyleSheet('globalCssTheme');
}

function wpGetHeaderPageStyleSheet() {
    return _dmGetStyleSheet('headerCss');
}

function wpGetHeaderPageDeviceStyleSheet() {
    return _dmGetStyleSheet('headerDeviceCss');
}

function wpGetPageStyleSheet() {
    return _dmGetStyleSheet('pagestyle');
}

function wpGetPageDeviceStyleSheet() {
    return _dmGetStyleSheet('pagestyleDevice');
}

function wpGetInnerPageStyleSheet() {
    return _dmGetStyleSheet('innerPagesStyle');
}

function wpGetInnerPageDeviceStyleSheet() {
    return _dmGetStyleSheet('innerPagesStyleDevice');
}

function _dmGetStyleSheet(styleSheetID) {
    if (isIE()) {
        return (styleSheet = document.styleSheets[styleSheetID]);
    } else {
        // go over the stylesheets, and get the one inside "globalCss"
        for (var i = 0; i < document.styleSheets.length; i++) {
            // get the owner node
            var node = _getSpecificSheetNode(document.styleSheets, i);
            if (node != null && node !== undefined) {
                // get node id
                var id = node.id;
                if (id != null && id !== undefined) {
                    if (id === styleSheetID) {
                        // we found the stylesheet
                        return document.styleSheets[i];
                    }
                }
            }
        }
        return null;
    }
}

function _getSpecificSheetNode(stylesheets, index) {
    var sheet = null;
    if (stylesheets && index !== undefined) {
        try {
            sheet = stylesheets[index];
            if (!sheet && stylesheets.item) {
                sheet = stylesheets.item(index);
            }
        } catch (e) {
            sheet = null;
        }
    }
    return sheet ? sheet.ownerNode : null;
}

function getGlobalCSSToString() {
    var styleSheet = wpGetStyleSheet();
    return _dmCSSToString(styleSheet);
}

function getPageCSSToString() {
    var styleSheet = wpGetPageStyleSheet();
    return _dmCSSToString(styleSheet);
}

function _dmCSSToString(styleSheet) {
    if (!styleSheet || styleSheet == null) return;
    var result = '';
    if (isIE()) {
        // run the ie version
        for (var i = 0; i < styleSheet.imports.length; i++) {
            // get rule
            var importCss = styleSheet.imports[i];
            result += "@import url('" + importCss.href + "');\n";
        }
        for (var i = 0; i < styleSheet.rules.length; i++) {
            // get rule
            var rule = styleSheet.rules[i];
            result += rule.cssText + '\n';
        }
    } else {
        for (var i = 0; i < styleSheet.cssRules.length; i++) {
            // get rule
            var rule = styleSheet.cssRules[i];
            result += rule.cssText + '\n';
        }
    }
    return result;
}

function updateCssInternal(selector, css, attributesArray, styleSheet, priority) {
    var foundRule = false;
    priority = priority || null;
    // look for the selector in the existing rules
    for (var i = 0; i < styleSheet.cssRules.length; i++) {
        // get rule
        var rule = styleSheet.cssRules[i];
        if (rule.constructor == CSSStyleRule) {
            // this is a style rule

            var ruleSelector = rule.selectorText.toLowerCase();
            ruleSelector = replaceAll(ruleSelector, '*', '');
            var mySelector = selector.toLowerCase();
            mySelector = replaceAll(mySelector, '*', '');

            if (ruleSelector === mySelector) {
                // we found the rule, now set its attributes
                for (var j = 0; j < attributesArray.length; j++) {
                    // get name
                    var key = attributesArray[j].key;
                    // get value
                    var value = attributesArray[j].value;

                    // set attribute
                    rule.style.setProperty(key, value, priority);
                }
                foundRule = true;
                //return;
            }
        }
    }
    return foundRule;
}

function updateCss(selector, css, attributesArray, allowTheme, priority) {

    if (isIE()) {
        // run the ie version
        updateCssIE(selector, css, attributesArray, allowTheme);
        return;
    }

    // get stylesheet
    var styleSheet = wpGetStyleSheet();

    var foundRule = updateCssInternal(selector, css, attributesArray, styleSheet, priority);

    if (allowTheme) {
        styleSheet = wpGetThemeStyleSheet();
        if (styleSheet && styleSheet != null) {
            foundRule = updateCssInternal(selector, css, attributesArray, styleSheet, priority) || foundRule;
        }
    }
    if (!foundRule) {
        // this is a new rule - add it at the end
        styleSheet.insertRule(selector + '{' + prioritizeCss(css, priority) + '}', styleSheet.cssRules.length);
    }
}

function prioritizeCss(css, priority) {
    retCss = css;
    if (priority) {
        retCss = css.replace(/;/g, ' !' + priority + ';');
        if (retCss.indexOf(priority) === -1) {
            retCss = css + ' !' + priority + ';';
        }
    }
    return retCss;
}

function removeCssAttributesFromStyleSheet(selector, attributesArray, ruleValidator, styleSheet) {
    if (styleSheet == null) return;

    // look for the selector in the existing rules
    for (var i = 0; i < styleSheet.cssRules.length; i++) {
        // get rule
        var rule = styleSheet.cssRules[i];

        if (rule.constructor == CSSStyleRule) {
            // this is a style rule

            var ruleSelector = rule.selectorText.toLowerCase();
            ruleSelector = replaceAll(ruleSelector, '*', '');
            var mySelector = selector.toLowerCase();
            mySelector = replaceAll(mySelector, '*', '');

            var isRule = ruleSelector === mySelector || (ruleValidator && ruleValidator(ruleSelector));
            if (isRule) {
                // we found the rule, now set its attributes
                for (var j = 0; j < attributesArray.length; j++) {
                    // get name
                    var key = attributesArray[j];

                    // remove attribute
                    rule.style.removeProperty(key);
                }
            }
        }
    }
    // we didnt find the rule - nothing to do
}

function removeCssAttributes(selector, attributesArray, ruleValidator, stylesheet) {
    if (isIE()) {
        removeCssAttributesIE(selector, attributesArray, ruleValidator);
        return;
    }
    // get stylesheet
    styleSheet = stylesheet || wpGetStyleSheet();
    removeCssAttributesFromStyleSheet(selector, attributesArray, ruleValidator, styleSheet);
}

function updateCssIEInternal(selector, css, attributesArray, styleSheet) {
    var foundRule = false;
    for (var i = 0; i < styleSheet.rules.length; i++) {
        // get rule
        var rule = styleSheet.rules[i];

        var ruleSelector = rule.selectorText.toLowerCase();
        ruleSelector = replaceAll(ruleSelector, '*', '');
        var mySelector = selector.toLowerCase();
        mySelector = replaceAll(mySelector, '*', '');

        if (ruleSelector === mySelector) {
            // we found the rule, now set its attributes
            for (var j = 0; j < attributesArray.length; j++) {
                // get name
                var key = attributesArray[j].key;

                // to camelcase
                // key = key.replace(/\-(.)/g, function(m, l){return
                // l.toUpperCase()});
                key = toCamelCase(key);

                // get value
                var value = attributesArray[j].value;
                // set attribute
                rule.style.setAttribute(key, value);
            }
            foundRule = true;
            // return;
        }
    }
    return foundRule;
}

function updateCssIE(selector, css, attributesArray, allowTheme) {
    // get stylesheet
    var styleSheet = wpGetStyleSheet();

    var foundRule = updateCssIEInternal(selector, css, attributesArray, styleSheet);
    // look for the selector in the existing rules
    if (allowTheme) {
        styleSheet = wpGetThemeStyleSheet();
        if (styleSheet && styleSheet != null) {
            foundRule = updateCssIEInternal(selector, css, attributesArray, styleSheet) || foundRule;
        }
    }

    if (!foundRule) {
        if (css != '') {
            // this is a new rule - add it at the end
            styleSheet.addRule(selector, css);
        }
    }
}

function removeCssAttributesIEInternal(selector, attributesArray, styleSheet, ruleValidator) {
    // look for the selector in the existing rules
    for (var i = 0; i < styleSheet.rules.length; i++) {
        // get rule
        var rule = styleSheet.rules[i];

        var ruleSelector = rule.selectorText.toLowerCase();
        ruleSelector = replaceAll(ruleSelector, '*', '');
        var mySelector = selector.toLowerCase();
        mySelector = replaceAll(mySelector, '*', '');

        var isRule = ruleSelector === mySelector || (ruleValidator && ruleValidator(ruleSelector));
        if (isRule) {
            // we found the rule, now set its attributes
            for (var j = 0; j < attributesArray.length; j++) {
                // get name
                var key = attributesArray[j];
                // to camelcase
                //    			key = key.replace(/\-(.)/g, function(m, l){return l.toUpperCase()});
                key = toCamelCase(key);

                // remove attribute
                rule.style.removeAttribute(key);
            }
            //    		return;
        }
    }
}

function removeCssAttributesIE(selector, attributesArray, ruleValidator) {
    // get stylesheet
    var styleSheet = wpGetStyleSheet();
    removeCssAttributesIEInternal(selector, attributesArray, styleSheet, ruleValidator);

    styleSheet = wpGetThemeStyleSheet();
    if (styleSheet && styleSheet != null) {
        removeCssAttributesIEInternal(selector, attributesArray, styleSheet, ruleValidator);
    }
}

function refreshGlobalCss(css, timeout) {
    if (isIE()) {
        refreshGlobalCssInternalIE(css, timeout, false);
    } else {
        refreshGlobalCssInternal(css, timeout, false);
    }
}

function refreshGlobalVariables(globalVariables) {
    if (!globalVariables) return;

    setTempCss(globalVariables, 'newCssVariables');
    removeStyleAndReplace('cssVariables', 'newCssVariables');
}

function refreshResponsiveGlobalCSS(globalCss) {
    if (!globalCss) return;

    setTempCss(globalCss, 'newResponsiveGlobalCss');
    removeStyleAndReplace('responsiveGlobalCss', 'newResponsiveGlobalCss');
}

function setOptimisticResponsiveGlobalCss(globalCss) {
    if (!globalCss) return;

    setTempCss(globalCss, 'optimisticResponsiveGlobalCss');
}

function removeOptimisticResponsiveGlobalCss() {
    removeStyle('optimisticResponsiveGlobalCss')
}

function refreshGlobalAndThemeCssInternal(themeCss, globalCss, timeout) {
    if (themeCss) {
        var newThemeStyle = document.createElement('style');
        //		setTimeout(function(){
        newThemeStyle.type = 'text/css';
        //			if(newThemeStyle.styleSheet)
        //				newThemeStyle.styleSheet.cssText = themeCss;
        //	    },0);
        jQuery(newThemeStyle).attr('id', 'newGlobalCssTheme');
        jQuery('head').append(newThemeStyle);
        jQuery(newThemeStyle).html(themeCss);
    }

    globalCss = globalCss || '';
    var newStyle = document.createElement('style');
    //	    setTimeout(function(){
    newStyle.type = 'text/css';
    if (newStyle.styleSheet) newStyle.styleSheet.cssText = globalCss;
    //	    },0);
    jQuery(newStyle).attr('id', 'newGlobalCss');
    jQuery('head').append(newStyle);
    jQuery(newStyle).html(globalCss);

    if (timeout == null) {
        timeout = 10;
    }
    if (timeout == 0) {
        removeOldCss();
        initComponents();
        return Promise.resolve();
    }
    return new Promise(function(resolve) {
        setTimeout(function() {
            removeOldCss();
            initComponents();
            resolve();
        }, timeout);
    });
}

function refreshGlobalCssInternal(css, timeout, nonThemeOnly) {
    var firstIndex = -1;
    var endIndex = -1;
    if (nonThemeOnly == false && jQuery('#globalCssTheme').length > 0) {
        firstIndex = css.indexOf('/*SITE_THEME_BEGIN*/');
        endIndex = css.indexOf('/*SITE_THEME_END*/');
    }
    var theme = '';
    var nonTheme = css;
    if (firstIndex != -1 && endIndex != -1) {
        var prefix = css.substring(0, firstIndex);
        var suffix = css.substring(endIndex + '/*DUDAMOBILE_THEME_END*/'.length);
        nonTheme = prefix + suffix;
        theme = css.substring(firstIndex, endIndex + '/*DUDAMOBILE_THEME_END*/'.length);

        var newThemeStyle = document.createElement('style');
        jQuery(newThemeStyle).html(theme);
        jQuery(newThemeStyle).attr('id', 'newGlobalCssTheme');
        jQuery('head').append(newThemeStyle);
    }

    var newStyle = document.createElement('style');
    jQuery(newStyle).html(nonTheme);
    jQuery(newStyle).attr('id', 'newGlobalCss');
    jQuery('head').append(newStyle);

    if (timeout == null) {
        timeout = 10;
    }
    if (timeout == 0) {
        removeOldCss();
        initComponents();
    } else {
        setTimeout(function() {
            removeOldCss();
            initComponents();
        }, timeout);
    }

    //Refreshing Generated CSS if it is a style tag
    refreshGeneratedCss();
}

function refreshGeneratedCss() {
    var $generatedCssToRemove = $('link[href^="/_dm/s/rt/generate_css"]');
    if ($generatedCssToRemove.length > 0) {
        var newTimeStampSuffix = '&timestamp=' + new Date().getTime();
        var generatedCssHref = $generatedCssToRemove.attr('href');
        var timeStampIndex = generatedCssHref.indexOf('&timestamp');
        if (timeStampIndex !== -1) {
            generatedCssHref = generatedCssHref.substr(0, timeStampIndex) + '&timestamp=' + newTimeStampSuffix;
        } else {
            generatedCssHref = generatedCssHref + '&timestamp=' + newTimeStampSuffix;
        }
        var $newCss = $('<link type="text/css" rel="stylesheet" href="' + generatedCssHref + '"/>');

        $newCss.one('load', function() {
            $generatedCssToRemove.remove();
        });
        $generatedCssToRemove.after($newCss);
    }
}

function refreshGlobalCssInternalIE(css, timeout, nonThemeOnly) {
    var firstIndex = -1;
    var endIndex = -1;
    if (nonThemeOnly == false && jQuery('#globalCssTheme').length > 0) {
        firstIndex = css.indexOf('/*DUDAMOBILE_THEME_BEGIN*/');
        endIndex = css.indexOf('/*DUDAMOBILE_THEME_END*/');
    }
    var theme = '';
    var nonTheme = css;
    if (firstIndex != -1 && endIndex != -1) {
        var prefix = css.substring(0, firstIndex);
        var suffix = css.substring(endIndex + '/*DUDAMOBILE_THEME_END*/'.length);
        nonTheme = prefix + suffix;
        theme = css.substring(firstIndex, endIndex + '/*DUDAMOBILE_THEME_END*/'.length);

        var newThemeStyle = document.createElement('style');

        setTimeout(function() {
            newThemeStyle.type = 'text/css';
            newThemeStyle.styleSheet.cssText = theme;
        }, 0);

        jQuery(newThemeStyle).attr('id', 'newGlobalCssTheme');
        jQuery('head').append(newThemeStyle);
    }

    var newStyle = document.createElement('style');

    setTimeout(function() {
        newStyle.type = 'text/css';
        newStyle.styleSheet.cssText = nonTheme;
    }, 0);

    jQuery(newStyle).attr('id', 'newGlobalCss');
    jQuery('head').append(newStyle);

    if (timeout == null) {
        timeout = 10;
    }
    if (timeout == 0) {
        removeOldCss();
        initComponents();
    } else {
        setTimeout(function() {
            removeOldCss();
            initComponents();
        }, timeout);
    }
}

function refreshCss(css, timeout, isHeader, options) {
    options = options || {};
    var funcName = options.funcName;
    var newId = options.newId;

    isHeader = isHeader || false;
    var newStyle = document.createElement('style');

    jQuery(newStyle).html(css);
    jQuery(newStyle).attr('id', newId);
    jQuery('head').append(newStyle);
    if (timeout == null) {
        timeout = 10;
    }
    if (timeout == 0) {
        window[funcName](isHeader);
        initComponents();
    } else {
        setTimeout(funcName + '(' + isHeader + '); initComponents();', timeout);
    }
}

function refreshPageStyleCss(css, timeout, isHeader, isInner) {
    if (isInner) {
        return refreshInnerPageStyleCss(css, timeout, isHeader);
    }
    var newId = isHeader ? 'newheaderCss' : 'newpagestyle';
    var funcName = 'removeOldPageStyle';
    refreshCss(css, timeout, isHeader, { funcName: funcName, newId: newId });
}

function refreshPageStyleDeviceCss(css, timeout, isHeader, isInner) {
    if (isInner) {
        return refreshInnerPageStyleDeviceCss(css, timeout, isHeader);
    }
    var newId = isHeader ? 'newheaderDeviceCss' : 'newpagestyleDevice';
    var funcName = 'removeOldDevicePageStyle';
    refreshCss(css, timeout, isHeader, { funcName: funcName, newId: newId });
}

function refreshInnerPageStyleCss(css, timeout, isHeader) {
    var newId = 'newinnerPagesStyle';
    var funcName = 'removeOldInnerPageStyle';
    refreshCss(css, timeout, isHeader, { funcName: funcName, newId: newId });
}

function refreshInnerPageStyleDeviceCss(css, timeout, isHeader) {
    var newId = 'newinnerPagesStyleDevice';
    var funcName = 'removeOldDeviceInnerPageStyle';
    refreshCss(css, timeout, isHeader, { funcName: funcName, newId: newId });
}

/**
 * @description: Initiate general components after the theme has changed
 */
function initComponents(dontCollapse) {
    if (!dontCollapse) {
        jQuery.DM.collapseNavigation();
    }
    jQuery.DM.restoreDefaultNavigationStyles();
    jQuery.DM.initNavbar(true);
}

_findCurrentNavText = function() {
    var hiddenNavElement = $("[id='hiddenNavPlaceHolder'] ul li:first").closest('#hiddenNavPlaceHolder');
    if (hiddenNavElement.size() > 0) {
        var currentLI = hiddenNavElement.find('li').filter(function() {
            return 'true' == $(this).attr('dmle_is_current_element');
        });
        if (currentLI.size() > 0) {
            return $(currentLI.get(0))
                .find('.navText:first')
                .text();
        }
    }
    return '';
};
_findCurrentNavId = function() {
    var hiddenNavElement = $("[id='hiddenNavPlaceHolder'] ul li:first").closest('#hiddenNavPlaceHolder');
    if (hiddenNavElement.size() > 0) {
        var currentLI = hiddenNavElement.find('li').filter(function() {
            return 'true' == $(this).attr('dmle_is_current_element');
        });
        if (currentLI.size() > 0) {
            return $(currentLI.get(0)).attr('id');
        }
    }
    return '';
};

function removeOldCss() {
    var oldStyle = $('#globalCss');
    var newStyle = $('#newGlobalCss');
    if (newStyle) {
        oldStyle.remove();
        newStyle.attr('id', 'globalCss');
    }
    var oldThemeStyle = document.getElementById('globalCssTheme');
    var newThemeStyle = document.getElementById('newGlobalCssTheme');
    if (newThemeStyle) {
        oldThemeStyle.parentNode.removeChild(oldThemeStyle);
        newThemeStyle.setAttribute('id', 'globalCssTheme');
    }
    hideLoading();

    var tempStyle = document.getElementById('tempCss');
    if (tempStyle && tempStyle != null) {
        tempStyle.parentNode.removeChild(tempStyle);
    }
}

function removeStyle(styleId) {
    const styleToRemove = document.getElementById(styleId);

    if (styleToRemove) {
        styleToRemove.parentNode.removeChild(styleToRemove);
    }
}

function removeStyleAndReplace(oldStyleId, newStyleId) {
    var styleId = oldStyleId;
    var oldStyle = document.getElementById(styleId);
    var newStyle = document.getElementById(newStyleId);

    var refStyle = oldStyle || document.getElementById('customWidgetStyle');
    refStyle.parentNode.insertBefore(newStyle, refStyle.nextElementSibling);
    if (oldStyle) {
        oldStyle.parentNode.removeChild(oldStyle);
    }
    newStyle.setAttribute('id', styleId);

    hideLoading();

    var tempStyle = document.getElementById('tempCss');
    if (tempStyle != null) {
        tempStyle.parentNode.removeChild(tempStyle);
    }
}

function removeOldPageStyle(isHeader) {
    removeStyleAndReplace(isHeader ? 'headerCss' : 'pagestyle', isHeader ? 'newheaderCss' : 'newpagestyle');
}

function removeOldDevicePageStyle(isHeader) {
    removeStyleAndReplace(
        isHeader ? 'headerDeviceCss' : 'pagestyleDevice',
        isHeader ? 'newheaderDeviceCss' : 'newpagestyleDevice'
    );
}

function removeOldInnerPageStyle(isHeader) {
    isHeader = false;
    removeStyleAndReplace(isHeader ? 'headerCss' : 'innerPagesStyle', isHeader ? 'newheaderCss' : 'newinnerPagesStyle');
}

function removeOldDeviceInnerPageStyle(isHeader) {
    isHeader = false;
    removeStyleAndReplace(
        isHeader ? 'headerDeviceCss' : 'innerPagesStyleDevice',
        isHeader ? 'newheaderDeviceCss' : 'newinnerPagesStyleDevice'
    );
}
function setDMAjaxNavSize(newSize) {
    Parameters.NavigationAreaParams.NavbarSize = newSize;
    if (Parameters.NavigationAreaParams.NavbarSize == -1) {
        Parameters.NavigationAreaParams.NavbarSize = Number.MAX_VALUE;
    }
}

var documentStyles = {
    queryCommandState: function(command) {
        try {
            return document.queryCommandState(command);
        } catch (e) {
            return false;
        }
    },
    queryCommandValue: function(command) {
        try {
            return document.queryCommandValue(command);
        } catch (e) {
            return null;
        }
    },
    dmCss: function(el, key, value) {
        if (value != '' && !value) {
            return el.css(key);
        }
        if (value == '') {
            return el.css(key, '');
        } else {
            var isImportant = value.indexOf('!important') != -1;
            if (isImportant) {
                value = value.replace('!important', '');
                el.css(key, '');
                el.each(function() {
                    var style = el.attr('style');
                    el.attr('style', (style ? style + ';' : '') + key + ': ' + value + ' !important');
                });
                return el;
            } else {
                return el.css(key, value);
            }
        }
    }
};