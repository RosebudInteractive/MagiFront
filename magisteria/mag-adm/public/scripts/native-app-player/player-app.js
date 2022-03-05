import AppPlayer from "./wrapper";

import 'script-lib/../widgets/work-shop/work-shop-custom.css'
import 'script-lib/../widgets/work-shop/player.css'
import 'script-lib/../widgets/work-shop/player-for-native-app.css'
import '../../css/font-awesome.css'
import '../../css/general-player.css'
import 'jquery-ui/jquery-ui.min.css';
import 'jquery-ui/jquery-ui.structure.min.css';

// Sentry.init({ dsn: 'https://4fb18e49474641faaeb712d2329f1549@sentry.io/1326933' });

(function ($) {
    $(document).ready(function () {
        new AppPlayer({externalPlayer: true});
    });
})(jQuery)
