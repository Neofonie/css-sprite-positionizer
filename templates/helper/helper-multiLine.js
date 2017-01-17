(function () {
    module.exports.register = function (Handlebars, options) {

        /*
         * multiLine helper.
         *
         * Determine {{#multiLine}} to oneline
         *
         * Example:
         * <span class="{{#multiLine this}}
         *    {{component}}__price-display--amount
         *    {{#if old_price}} jsOldPriceInsert {{else}} jsPriceInsert {{/if}}
         *    currency-{{#if currency_after}}after{{else}}before{{/if}}
         * {{/multiLine}}"></span>
         *
         * @return product-stage__price-display--amount jsPriceInsert currency--before
         */

        Handlebars.registerHelper("multiLine", function (scope, block) {
            var regex = /\S.*/g,
                string = block.fn(scope),
                classes = [],
                m;

            while ((m = regex.exec(string)) !== null) {
                classes.push(m[0]);
            }

            return new Handlebars.SafeString(classes.join(" "));
        });
    };
}).call(this);
