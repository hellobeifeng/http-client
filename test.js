var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var should = require('chai').should();// 引入should断言库

var HttpClient = require('./app.js');
var http = new HttpClient();

var baseTestUrlPrefix = 'https://api.douban.com';

describe('测试http基本请求:请求豆瓣图书api', function(done) {
  this.timeout(5000);//设置超时时间为5s
  it('should return 200 and parse json text to object', function() {
    return http.$getJson('https://api.douban.com/v2/book/1220562').should.eventually.satisfy(function(obj) {
      //console.log(obj)
      return obj;
    }).notify(done)
  })
});

describe('测试统一前缀功能', function(done) {
  before(function() {
    http.$setUrlPrefix(baseTestUrlPrefix)
  });

  it('https://api.douban.com/', function() {
    return http.$getJson('/v2/book/1220562').should.eventually.satisfy(function(obj) {
      return obj
    }).notify(done)
  })
});

describe('测试单例功能', function(done) {
  before(function() {
    HttpClient.$getDefaultClient(baseTestUrlPrefix)
  });

  it('should return 200 and parse json text to object - singleton', function() {
    // 此处不设置前缀，如果单例功能有效，则使用前一步设置的前缀
    return HttpClient.$getDefaultClient().$getJson('https://api.douban.com/v2/book/1220562').should.eventually.satisfy(function(obj) {
      console.log(obj);
      return obj;
    }).notify(done)
  })
});

describe('测试入参过滤器设置', function(){
  before(function() {
    http.$addParamsFilter({
      filterParams:function(params) {
        params.__addParam = 1;
        return params;
      }
    });
  });

  it('should handle get request', function(){
    return http.getOptions('http://a.example.com/interface', 'GET').should.satisfy(function(obj){
      return obj.uri.indexOf('__addParam') > 0;
    });
  });

  it('should handle post request', function(){
    return http.getOptions('http://a.example.com/interface', 'POST', {}).should.satisfy(function(obj){
      return obj.form.__addParam == 1;
    })
  });

  after(function() {
    http.$clearParamsFilter();
  });
});

describe('测试参数拼接', function(){

  it('url和params都有参数，拼接正确', function(){
    return http.getOptions('http://a.example.com/interface?a=1&b=3', 'GET', {b:2}).should.satisfy(function(obj){
      return obj.uri == 'http://a.example.com/interface?a=1&b=3';
    });
  });

  it('只有params有参数，拼接正确', function(){
    return http.getOptions('http://a.example.com/interface', 'GET', {b:2}).should.satisfy(function(obj){
      return obj.uri == 'http://a.example.com/interface?b=2';
    });
  });

  it('只有url有参数，拼接正确', function(){
    return http.getOptions('http://a.example.com/interface?a=1', 'GET').should.satisfy(function(obj){
      return obj.uri == 'http://a.example.com/interface?a=1';
    });
  });

});