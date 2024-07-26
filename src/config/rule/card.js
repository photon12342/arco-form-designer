import {localeOptions, localeProps} from '../../utils';

const label = '卡片';
const name = 'aCard';

export default {
    menu: 'layout',
    icon: 'icon-card',
    label,
    name,
    drag: true,
    inside: false,
    mask: false,
    rule({t}) {
        return {
            type: name,
            props: {
                header: t('com.aCard.props.header')
            },
            style: {
                width: '100%'
            },
            children: []
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [{
            type: 'input',
            field: 'header',
        }, {
            type: 'select',
            field: 'shadow',
            value: 'always',
            options: localeOptions(t, [{label: 'always', value: 'always'}, {label: 'never', value: 'never'}, {
                label: 'hover',
                value: 'hover'
            }])
        }]);
    }
};
