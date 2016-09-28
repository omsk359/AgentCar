export const DEBUG = typeof localStorage != 'undefined' && !!localStorage.getItem('agentCarDebug');

export function checkInput(input) {
    var val = $(input).val();
    var errField = $(input).parent().find('.agent_car_field_error');
    var required = $(input).attr('required');
    required = typeof required !== typeof undefined && required !== false;
    if (!required && val == '') {
        errField.hide();
        return true;
    }
    var check = $(input).data('check');
    if (!check)
        var ok = required ? val : false;
    else
        ok = new RegExp(check).test(val);
    ok ? errField.hide() : errField.show();
    return ok;
}
export const checkAllInputs = inputs => _.every(inputs.map(checkInput));

export function update_zIndex(underElements, overElements) {
    var zIndexWidget;
    if (underElements) {
        let zIndexUnder = underElements.split(',').map(el => $(el).zIndex());
        DEBUG && console.log(`zIndexUnder("${underElements}"): `, zIndexUnder);
        let zIndexUnderMax = _.max(zIndexUnder);
        DEBUG && console.log('zIndexUnderMax: ', zIndexUnderMax);
        zIndexWidget = zIndexUnderMax + 1;
    }
    if (overElements) {
        let zIndexOver = overElements.split(',').map(el => $(el).zIndex());
        let zIndexOverMin = _.min(zIndexOver);
        DEBUG && console.log('zIndexOverMin: ', zIndexOverMin);
        if (zIndexWidget && zIndexWidget > zIndexOverMin)
            zIndexWidget = zIndexOverMin - 1;
    }
    if (zIndexWidget)
        $('.agent_car_widget').zIndex(zIndexWidget);
}

