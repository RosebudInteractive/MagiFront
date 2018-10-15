import AppPlayer from "./wrapper";

import 'script-lib/../widgets/work-shop/work-shop-custom.css'
import 'script-lib/../widgets/work-shop/player.css'
import 'script-lib/../widgets/work-shop/player-for-native-app.css'
import '../../css/font-awesome.css'
import '../../css/general-player.css'
import 'jquery-ui/jquery-ui.min.css';
import 'jquery-ui/jquery-ui.structure.min.css';

(function ($) {
    $(document).ready(function () {
        new AppPlayer();
    });
})(jQuery)
