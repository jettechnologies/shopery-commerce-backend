(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['order-cancelled'] = template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "          <tr style=\"border-bottom: 1px solid #eee\">\r\n            <td>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "</td>\r\n            <td align=\"center\">"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"quantity") : depth0), depth0))
    + "</td>\r\n            <td align=\"right\">$"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"unitPrice") : depth0), depth0))
    + "</td>\r\n            <td align=\"right\">$"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"subtotal") : depth0), depth0))
    + "</td>\r\n          </tr>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<!doctype html>\r\n<html>\r\n  <body\r\n    style=\"\r\n      font-family: Arial, sans-serif;\r\n      background-color: #f9f9f9;\r\n      margin: 0;\r\n      padding: 0;\r\n    \"\r\n  >\r\n    <div\r\n      style=\"\r\n        max-width: 600px;\r\n        margin: 40px auto;\r\n        padding: 20px;\r\n        background: #fff;\r\n        border-radius: 10px;\r\n        border: 1px solid #e0e0e0;\r\n      \"\r\n    >\r\n      <h2 style=\"color: #d9534f\">Order Cancelled - #"
    + alias4(((helper = (helper = lookupProperty(helpers,"orderId") || (depth0 != null ? lookupProperty(depth0,"orderId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"orderId","hash":{},"data":data,"loc":{"start":{"line":21,"column":52},"end":{"line":21,"column":63}}}) : helper)))
    + "</h2>\r\n\r\n      <p>Your order has been <strong>cancelled</strong>.</p>\r\n\r\n      <table\r\n        width=\"100%\"\r\n        cellpadding=\"8\"\r\n        cellspacing=\"0\"\r\n        style=\"border-collapse: collapse; margin-top: 20px\"\r\n      >\r\n        <thead>\r\n          <tr style=\"background-color: #f4f4f4\">\r\n            <th align=\"left\">Product</th>\r\n            <th align=\"center\">Qty</th>\r\n            <th align=\"right\">Price</th>\r\n            <th align=\"right\">Subtotal</th>\r\n          </tr>\r\n        </thead>\r\n        <tbody>\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"items") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":40,"column":10},"end":{"line":47,"column":19}}})) != null ? stack1 : "")
    + "        </tbody>\r\n      </table>\r\n\r\n      <p style=\"text-align: right; font-weight: bold; margin-top: 20px\">\r\n        Total Refunded: $"
    + alias4(((helper = (helper = lookupProperty(helpers,"total") || (depth0 != null ? lookupProperty(depth0,"total") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"total","hash":{},"data":data,"loc":{"start":{"line":52,"column":25},"end":{"line":52,"column":34}}}) : helper)))
    + "\r\n      </p>\r\n\r\n      <p style=\"margin-top: 30px\">\r\n        If you did not request this, please contact support immediately.\r\n      </p>\r\n\r\n      <p><strong>Shopery Team</strong></p>\r\n    </div>\r\n  </body>\r\n</html>\r\n";
},"useData":true});
templates['order-confirmation'] = template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "          <tr style=\"border-bottom: 1px solid #eee\">\r\n            <td>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "</td>\r\n            <td align=\"center\">"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"quantity") : depth0), depth0))
    + "</td>\r\n            <td align=\"right\">$"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"unitPrice") : depth0), depth0))
    + "</td>\r\n            <td align=\"right\">$"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"subtotal") : depth0), depth0))
    + "</td>\r\n          </tr>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<!doctype html>\r\n<html>\r\n  <body\r\n    style=\"\r\n      font-family: Arial, sans-serif;\r\n      line-height: 1.5;\r\n      background-color: #f9f9f9;\r\n      margin: 0;\r\n      padding: 0;\r\n    \"\r\n  >\r\n    <div\r\n      style=\"\r\n        max-width: 600px;\r\n        margin: 40px auto;\r\n        padding: 20px;\r\n        background: #fff;\r\n        border-radius: 10px;\r\n        border: 1px solid #e0e0e0;\r\n      \"\r\n    >\r\n      <h2 style=\"color: #8e6cef\">Order Confirmation - #"
    + alias4(((helper = (helper = lookupProperty(helpers,"orderId") || (depth0 != null ? lookupProperty(depth0,"orderId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"orderId","hash":{},"data":data,"loc":{"start":{"line":22,"column":55},"end":{"line":22,"column":66}}}) : helper)))
    + " 🧾</h2>\r\n\r\n      <p>Thank you for shopping with <strong>Shopery Organic</strong>!</p>\r\n\r\n      <table\r\n        width=\"100%\"\r\n        cellpadding=\"8\"\r\n        cellspacing=\"0\"\r\n        style=\"border-collapse: collapse; margin-top: 20px\"\r\n      >\r\n        <thead>\r\n          <tr style=\"background-color: #f4f4f4\">\r\n            <th align=\"left\">Product</th>\r\n            <th align=\"center\">Qty</th>\r\n            <th align=\"right\">Price</th>\r\n            <th align=\"right\">Subtotal</th>\r\n          </tr>\r\n        </thead>\r\n        <tbody>\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"items") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":41,"column":10},"end":{"line":48,"column":19}}})) != null ? stack1 : "")
    + "        </tbody>\r\n      </table>\r\n\r\n      <p\r\n        style=\"\r\n          text-align: right;\r\n          font-size: 18px;\r\n          font-weight: bold;\r\n          margin-top: 20px;\r\n        \"\r\n      >\r\n        Total: $"
    + alias4(((helper = (helper = lookupProperty(helpers,"total") || (depth0 != null ? lookupProperty(depth0,"total") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"total","hash":{},"data":data,"loc":{"start":{"line":60,"column":16},"end":{"line":60,"column":25}}}) : helper)))
    + "\r\n      </p>\r\n\r\n      <p style=\"margin-top: 30px\">Happy shopping! 🌿</p>\r\n      <p><strong>Shopery Team</strong></p>\r\n    </div>\r\n  </body>\r\n</html>\r\n";
},"useData":true});
templates['order-status-update'] = template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "          <tr style=\"border-bottom: 1px solid #eee\">\r\n            <td>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "</td>\r\n            <td align=\"center\">"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"quantity") : depth0), depth0))
    + "</td>\r\n            <td align=\"right\">$"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"unitPrice") : depth0), depth0))
    + "</td>\r\n            <td align=\"right\">$"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"subtotal") : depth0), depth0))
    + "</td>\r\n          </tr>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<!doctype html>\r\n<html>\r\n  <body\r\n    style=\"\r\n      font-family: Arial, sans-serif;\r\n      background-color: #f9f9f9;\r\n      margin: 0;\r\n      padding: 0;\r\n    \"\r\n  >\r\n    <div\r\n      style=\"\r\n        max-width: 600px;\r\n        margin: 40px auto;\r\n        padding: 20px;\r\n        background: #fff;\r\n        border-radius: 10px;\r\n        border: 1px solid #e0e0e0;\r\n      \"\r\n    >\r\n      <h2 style=\"color: #8e6cef\">Order Update - #"
    + alias4(((helper = (helper = lookupProperty(helpers,"orderId") || (depth0 != null ? lookupProperty(depth0,"orderId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"orderId","hash":{},"data":data,"loc":{"start":{"line":21,"column":49},"end":{"line":21,"column":60}}}) : helper)))
    + "</h2>\r\n\r\n      <p>Your order status is now:</p>\r\n\r\n      <p style=\"font-size: 18px; font-weight: bold; color: #8e6cef\">\r\n        "
    + alias4(((helper = (helper = lookupProperty(helpers,"status") || (depth0 != null ? lookupProperty(depth0,"status") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"status","hash":{},"data":data,"loc":{"start":{"line":26,"column":8},"end":{"line":26,"column":18}}}) : helper)))
    + "\r\n      </p>\r\n\r\n      <table\r\n        width=\"100%\"\r\n        cellpadding=\"8\"\r\n        cellspacing=\"0\"\r\n        style=\"border-collapse: collapse; margin-top: 20px\"\r\n      >\r\n        <thead>\r\n          <tr style=\"background-color: #f4f4f4\">\r\n            <th align=\"left\">Product</th>\r\n            <th align=\"center\">Qty</th>\r\n            <th align=\"right\">Price</th>\r\n            <th align=\"right\">Subtotal</th>\r\n          </tr>\r\n        </thead>\r\n        <tbody>\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"items") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":44,"column":10},"end":{"line":51,"column":19}}})) != null ? stack1 : "")
    + "        </tbody>\r\n      </table>\r\n\r\n      <p style=\"text-align: right; font-weight: bold; margin-top: 20px\">\r\n        Total: $"
    + alias4(((helper = (helper = lookupProperty(helpers,"total") || (depth0 != null ? lookupProperty(depth0,"total") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"total","hash":{},"data":data,"loc":{"start":{"line":56,"column":16},"end":{"line":56,"column":25}}}) : helper)))
    + "\r\n      </p>\r\n\r\n      <p style=\"margin-top: 30px\">\r\n        If you have questions, reply to this email.\r\n      </p>\r\n\r\n      <p><strong>Shopery Team</strong></p>\r\n    </div>\r\n  </body>\r\n</html>\r\n";
},"useData":true});
templates['otp-verification'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<!doctype html>\n<html>\n  <body\n    style=\"\n      font-family: Arial, sans-serif;\n      line-height: 1.5;\n      background-color: #f9f9f9;\n      color: #333;\n      margin: 0;\n      padding: 0;\n    \"\n  >\n    <div\n      style=\"\n        max-width: 600px;\n        margin: 40px auto;\n        padding: 20px;\n        background-color: #ffffff;\n        border-radius: 10px;\n        border: 1px solid #e0e0e0;\n        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);\n      \"\n    >\n      <h2 style=\"color: #8e6cef; margin-bottom: 20px\">Hello, "
    + alias4(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data,"loc":{"start":{"line":24,"column":61},"end":{"line":24,"column":69}}}) : helper)))
    + " 🎉</h2>\n\n      <p style=\"font-size: 16px; color: #222222\">\n        Thank you for joining <strong>Shopery Organic</strong>. We're excited to\n        have you onboard!\n      </p>\n\n      <p\n        style=\"\n          font-weight: bold;\n          font-size: 16px;\n          margin: 20px 0 10px 0;\n          color: #333333;\n        \"\n      >\n        Your verification code is:\n      </p>\n\n      <div\n        style=\"\n          font-size: 28px;\n          font-weight: bold;\n          color: #8e6cef;\n          text-align: center;\n          padding: 15px 0;\n          border: 1px dashed #8e6cef;\n          border-radius: 8px;\n          margin-bottom: 20px;\n        \"\n      >\n        "
    + alias4(((helper = (helper = lookupProperty(helpers,"otp") || (depth0 != null ? lookupProperty(depth0,"otp") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"otp","hash":{},"data":data,"loc":{"start":{"line":54,"column":8},"end":{"line":54,"column":15}}}) : helper)))
    + "\n      </div>\n\n      <p style=\"font-size: 14px; color: #555555\">\n        Please use this code to verify your email. It will expire in\n        "
    + alias4(((helper = (helper = lookupProperty(helpers,"expiry_time") || (depth0 != null ? lookupProperty(depth0,"expiry_time") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"expiry_time","hash":{},"data":data,"loc":{"start":{"line":59,"column":8},"end":{"line":59,"column":23}}}) : helper)))
    + ".\n      </p>\n\n      <p style=\"font-size: 14px; color: #555555; margin-top: 30px\">\n        Happy shopping!<br />\n        <strong>Shopery Team</strong>\n      </p>\n    </div>\n  </body>\n</html>\n";
},"useData":true});
templates['password-reset'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<!doctype html>\r\n<html>\r\n  <body\r\n    style=\"\r\n      font-family: Arial, sans-serif;\r\n      line-height: 1.5;\r\n      background-color: #f9f9f9;\r\n      color: #333;\r\n      margin: 0;\r\n      padding: 0;\r\n    \"\r\n  >\r\n    <div\r\n      style=\"\r\n        max-width: 600px;\r\n        margin: 40px auto;\r\n        padding: 20px;\r\n        background-color: #ffffff;\r\n        border-radius: 10px;\r\n        border: 1px solid #e0e0e0;\r\n        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);\r\n      \"\r\n    >\r\n      <h2 style=\"color: #8e6cef\">Password Reset Request 🔐</h2>\r\n\r\n      <p>You requested to reset your password.</p>\r\n\r\n      <p style=\"margin: 20px 0 10px 0; font-weight: bold\">Your reset code:</p>\r\n\r\n      <div\r\n        style=\"\r\n          font-size: 28px;\r\n          font-weight: bold;\r\n          color: #8e6cef;\r\n          text-align: center;\r\n          padding: 15px 0;\r\n          border: 1px dashed #8e6cef;\r\n          border-radius: 8px;\r\n        \"\r\n      >\r\n        "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"otp") || (depth0 != null ? lookupProperty(depth0,"otp") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"otp","hash":{},"data":data,"loc":{"start":{"line":41,"column":8},"end":{"line":41,"column":15}}}) : helper)))
    + "\r\n      </div>\r\n\r\n      <p style=\"font-size: 14px; color: #555; margin-top: 20px\">\r\n        If you didn’t request this, please ignore this email.\r\n      </p>\r\n\r\n      <p style=\"margin-top: 30px\">— <strong>Shopery Team</strong></p>\r\n    </div>\r\n  </body>\r\n</html>\r\n";
},"useData":true});
templates['welcome'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<!doctype html>\r\n<html>\r\n  <body\r\n    style=\"\r\n      font-family: Arial, sans-serif;\r\n      line-height: 1.5;\r\n      background-color: #f9f9f9;\r\n      color: #333;\r\n      margin: 0;\r\n      padding: 0;\r\n    \"\r\n  >\r\n    <div\r\n      style=\"\r\n        max-width: 600px;\r\n        margin: 40px auto;\r\n        padding: 20px;\r\n        background-color: #ffffff;\r\n        border-radius: 10px;\r\n        border: 1px solid #e0e0e0;\r\n        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);\r\n      \"\r\n    >\r\n      <h2 style=\"color: #8e6cef; margin-bottom: 20px\">Welcome, "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"name","hash":{},"data":data,"loc":{"start":{"line":24,"column":63},"end":{"line":24,"column":71}}}) : helper)))
    + " 🎉</h2>\r\n\r\n      <p style=\"font-size: 16px; color: #222222\">\r\n        Your email has been successfully verified. We're thrilled to have you as\r\n        part of <strong>Shopery Organic</strong>!\r\n      </p>\r\n\r\n      <p style=\"font-size: 16px; color: #222222; margin: 20px 0 10px 0\">\r\n        You can now explore our products and enjoy a seamless shopping\r\n        experience.\r\n      </p>\r\n\r\n      <p style=\"font-size: 14px; color: #555555; margin-top: 30px\">\r\n        Happy shopping!<br />\r\n        <strong>Shopery Team</strong>\r\n      </p>\r\n    </div>\r\n  </body>\r\n</html>\r\n";
},"useData":true});
})();