import {localeProps} from '../../utils';

const label = '折叠面板';
const name = 'aCollapse';

export default {
    menu: 'layout',
    icon: 'icon-collapse',
    label,
    name,
    mask: false,
    children: 'aCollapseItem',
    event: ['change'],
    rule() {
        return {
            type: name,
            props: {},
            style: {
                width: '100%',
            },
            children: []
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [{
            type: 'switch',
            field: 'accordion'
        }]);
    }
};
