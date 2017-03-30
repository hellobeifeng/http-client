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

