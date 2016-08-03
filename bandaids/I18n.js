// TODO: remove when merging into get_smart

require('vendor/i18n');
require('vendor/i18n_js_extension');

const moment = require('moment');
const I18n = window.I18n;
I18n.translations = I18n.translations || {};

const canLolcalize = (process.env.NODE_ENV !== 'production' || window.DEPLOY_ENV === 'edge');
if (canLolcalize) { // don't add the extra overhead in prod
  const lolcalize = require('I18n.lolcalize.js');

  // so that it's a valid locale
  I18n.translations.lol = I18n.translations.lol || {locales: {lol: '! LOL !'}};

  const lookup = I18n.lookup.bind(I18n);
  I18n.lookup = function(scope, options) {
    var messages = lookup(scope, options);
    if (!lolcalize.isEnabled()) return messages;
    if (!options || options.locale !== 'en') return messages; // only lolcalize on the second lookup (fallback to en)

    return lolcalize(messages);
  };
}

I18n.pluralize = function(count, scope, options) {
  var translation;

  try {
    translation = this.lookup(scope, options);
  } catch (error) {
    //don't blow chunk
  }

  if (!translation) {
    return this.missingTranslation(scope);
  }

  var message;
  options = this.prepareOptions(options, {precision: 0});
  options.count = this.toNumber(count, options);

  var pluralizer = this.pluralizer(this.currentLocale());
  var key = pluralizer(Math.abs(count));
  var keys = ((typeof key === "object") && (key instanceof Array)) ? key : [key];

  message = this.findAndTranslateValidNode(keys, translation);
  if (message === null) message = this.missingTranslation(scope, keys[0]);

  return this.interpolate(message, options);
};

// disable lookups during app boot / module definitions, cuz we shouldn't
// be doing that; always be translating at runtime
const frdLookup = I18n.lookup;

if (window.PREVENT_PREMATURE_I18N_LOOKUPS) {
  I18n.lookup = () => {
    throw new Error('Don\'t call I18n.t in a module definition (boot time), put it in a function (run time) so it actually gets translated');
  };
}

const momentLocaleMap = {'pt-BR': 'pt-br', 'zh': 'zh-cn'};

I18n.setLocale = function(locale) {
  I18n.locale = locale;
  moment.locale([momentLocaleMap[locale] || locale, 'en']);
};

I18n.fallbacks = true;

I18n.enableLookups = function() {
  I18n.lookup = frdLookup;
};

// react-i18nliner preprocesses <Text> into this
I18n.ComponentInterpolator = require('react-i18nliner/ComponentInterpolator');

I18n.l = I18n.localize = () => {
  return 'Use moment.js instead of I18n.localize';
};

module.exports = I18n;
