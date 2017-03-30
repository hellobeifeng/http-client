var request = require('request');
var _ = require('underscore');
var URI = require('urijs');

/**
 * 实现标准接口的nodejs httpClient类，将request库请求封装为Promise对象，并提供入参过滤、统一前缀、json解析等统一设置
 * @param {String}  urlPrefix     url统一前缀（http://example.interface.com）
 * @param {Object}  paramsFilters  实现filterParams方法的对象(外部注入的方法，用于处理参数)
 * @constructor
 */
var HttpClient = function( urlPrefx, paramsFilters ) {
  this.urlPrefix = urlPrefx;
  this.paramsFilters = paramsFilters;
};

/**
 * 获取defaultClient单例
 * @param {String}  urlPrefix     url统一前缀
 * @param {Object}  paramsFilters  实现filterParams方法的对象
 * @returns {HttpClient}
 */
HttpClient.$getDefaultClient = function( urlPrefix, paramsFIlters ) {
  if(!HttpClient.defaultClient) {
    HttpClient.defaultClient = new HttpClient( urlPrefix, paramsFIlters);
  }
  return HttpClient.defaultClient;
};


/**
 * 添加参数过滤器
 * @param {object}  value 实现了filterParams方法的对象
 */
HttpClient.prototype.$addParamsFilter = function(value) {
  this.paramsFilters = this.paramsFilters || [];
  var replaceFlag = false;
  // 判断是否存在同类型过滤器，如果存在则替换，不存在则增加
  for(var i= 0; i < this.paramsFilters.length; i++) {
    var filter = this.paramsFilters[i];
    if (value.constructor == filter.constructor) {
      this.paramsFilters.splice(i, 1, value);
      replaceFlag = true;
      break;
    };
  };

  if (!replaceFlag) {
    this.paramsFilters.push(value);
  }
};

/**
 * 清除参数过滤器
 */
HttpClient.prototype.$clearParamsFilter = function() {
  this.paramsFilters = [];
};

/**
 * @description 设置接口前缀
 * @param {String} value 接口前缀
 */
HttpClient.prototype.$setUrlPrefix = function(value) {
  this.urlPrefix = value;
};

/**
 * @description 根据入参生成请求信息，并根据配置增加统一前缀、过滤参数及其他统一处理
 * @param url   接口入参url
 * @param method    请求类型 GET / POST
 * @param params    处理后最终的http请求信息
 */
HttpClient.prototype.getOptions = function( url, method, params ) {

  // request请求结构体
  var result = {
    uri: url
  };

  // var result = {
  //   uri: string,
  //   timeout: number,
  //   method: GET/POST
  // };


  params = params || {};

  // 第一步：设置result.uri前缀: 如果是相对路径（没设置前缀）则使用程序设置的前缀
  if( result.uri && result.uri.indexOf('http') !== 0 ) {
    result.uri = this.urlPrefix + result.uri;
  }

  // 第二步：设置result.method: 默认GET
  result.method = method || 'GET';


  // 第三步：post请求，设置result.from；get请求，设置result.uri
  if ( result.method === 'POST' ) {
    result.form = params;

    // 使用外部注入的过滤器处理参数
    if( this.paramsFilters ) {
      this.paramsFilters.forEach(function(filter) {
        result.form = filter.filterParams(result.form)
      })
    }
  } else {
    var uri = new URI(result.uri); // 使用result.uri字符串生成url对象
    var paramStr = uri.search();// 获得url中的query字符串
    var paramObj = URI.parseQuery(paramStr);// 获得query请求对象
    var resultParams = _.extend(params, paramObj);// 用result.uri中的请求对象extend接口入参对象，get请求中url中的优先级比较高
    resultParams = dealElement(resultParams);//过滤掉接口请求参数对象中的无效字段:undefined null ''

    if (this.paramsFilters) {
      this.paramsFilters.forEach(function(filter){
        resultParams = filter.filterParams(resultParams);
      });
    }
    // 重新设置result.uri的请求参数
    uri.setSearch(resultParams);
    result.uri = uri.toString();

  }

  // 第四步：设置result.timeout
  result.timeout = result.timeout || 60000;

  return result;
};

/**
 * @description 将请求封装为Promise对象
 * @param {Object} options
 * @returns {Promise} 请求对应的Promise对象
 * @see {@link https://github.com/request/request#requestoptions-callback}
 */
HttpClient.prototype.request = function (options) {
  var that = this;
  return new Promise(function(resolve, reject){
    request(options, function (err, response, body) {
      if (!err) {
        if (response.statusCode == 200 || response.statusCode == 304) {
          resolve(body);
        } else {
          reject(err);
        }
      } else {
        reject(err);
      }
    });
  });
};

/**
 * @description http get请求接口
 * @param {String}    url   接口请求url
 * @param {object}    params    参数对象
 * @returns {Promise}
 */
HttpClient.prototype.$get = function( url, params ) {
  var options = this.getOptions( url, 'GET', params );// 根据规则生成request请求参数
  return this.request(options);
};


/**
 * @description $get方法的代理，发起http get请求，（将$get请求返回的字符串转换为JSON对象）
 * @param {String}    url   接口请求url
 * @param {object}    params    参数对象
 * @returns {Promise}
 */
HttpClient.prototype.$getJson = function( url, params ) {
  return this.$get( url, params ).then(function( body ) {
    return JSON.parse(body)
  })
};

/**
 * @description http post请求接口
 * @param {String|Object} options 请求url
 * @param {String|Object} form 表单参数
 * @returns {Promise}
 */
HttpClient.prototype.$post = function (url, params) {
  var options = this.getOptions(url, 'POST', params);// 根据规则生成request请求参数
  return this.request(options);
};
/**
 * @description $get方法的代理，发起http get请求，（将$post请求返回的字符串转换为JSON对象）
 * @param {String}  url   请求url
 * @param {Object}  params  请求对象，比如表单键值对
 * @returns {Promise}
 */
HttpClient.prototype.$postJson = function (url, params) {
  return this.$post(url, params).then(function (body) {
    return JSON.parse(body);
  });
};

// 工具方法：去掉对象中的value是无效值得key
function dealElement(obj){
  var param = {};
  if ( obj === null || obj === undefined || obj === "" ) return param;
  for ( var key in obj ){
    if ( obj[key] !== null && obj[key] !== undefined && obj[key] !== "" ){
      param[key] = obj[key];
    }
  }
  return param;
}

module.exports = exports = HttpClient;