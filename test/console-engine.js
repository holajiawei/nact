/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);

const { start, dispatch, stop, spawnStateless } = require('../lib');
const {
  LogLevel,
  LogEvent,
  logToConsole,
  configureLogging
} = require('../lib/monitoring');

describe('logToConsole', () => {
  it('it should be a function', () =>
    logToConsole.should.be.instanceOf(Function));

  const testCalled = (positives, negatives) => {
    positives.forEach(spy => spy.should.have.been.called);
    negatives.forEach(spy => spy.should.have.not.been.called);
  };

  describe('When logToConsole is used with a console-proxy', () => {
    const initTest = () => {
      const consoleProxy = {
        trace: sinon.spy(function trace () {}),
        debug: sinon.spy(function debug () {}),
        info: sinon.spy(function info () {}),
        warn: sinon.spy(function warn () {}),
        error: sinon.spy(function error () {}),
        critical: sinon.spy(function critical () {})
      };
      const system = start(configureLogging(logToConsole(consoleProxy)));
      return [ consoleProxy, system ];
    };

    const endTest = (consoleProxy, system) => {
      stop(system);
    };

    it('off should not call any console channel', done => {
      const [ consoleProxy, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.off('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled(
          [],
          [
            consoleProxy.trace,
            consoleProxy.debug,
            consoleProxy.info,
            consoleProxy.warn,
            consoleProxy.error,
            consoleProxy.critical
          ]
        );
        done();
        endTest(consoleProxy, system);
      }, 25);
    });

    it('should call console trace channel', done => {
      const [ consoleProxy, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.trace('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled(
          [ consoleProxy.trace ],
          [
            consoleProxy.debug,
            consoleProxy.info,
            consoleProxy.warn,
            consoleProxy.error,
            consoleProxy.critical
          ]
        );
        done();
        endTest(consoleProxy, system);
      }, 25);
    });

    it('should call console debug channel', done => {
      const [ consoleProxy, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.debug('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled(
          [consoleProxy.debug],
          [
            consoleProxy.trace,
            consoleProxy.info,
            consoleProxy.warn,
            consoleProxy.error,
            consoleProxy.critical
          ]
        );
        done();
        endTest(consoleProxy, system);
      }, 25);
    });

    it('should call console info channel', done => {
      const [ consoleProxy, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.info('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled(
          [consoleProxy.info],
          [
            consoleProxy.trace,
            consoleProxy.debug,
            consoleProxy.warn,
            consoleProxy.error,
            consoleProxy.critical
          ]
        );
        done();
        endTest(consoleProxy, system);
      }, 25);
    });

    it('should call console warn channel', done => {
      const [ consoleProxy, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.warn('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled(
          [consoleProxy.warn],
          [
            consoleProxy.trace,
            consoleProxy.debug,
            consoleProxy.info,
            consoleProxy.error,
            consoleProxy.critical
          ]
        );
        done();
        endTest(consoleProxy, system);
      }, 25);
    });

    it('should call console error channel', done => {
      const [ consoleProxy, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.error('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled(
          [consoleProxy.error],
          [
            consoleProxy.trace,
            consoleProxy.debug,
            consoleProxy.info,
            consoleProxy.warn,
            consoleProxy.critical
          ]
        );
        done();
        endTest(consoleProxy, system);
      }, 25);
    });

    it('should call console critical channel', done => {
      const [ consoleProxy, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.critical('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled(
          [consoleProxy.critical],
          [
            consoleProxy.trace,
            consoleProxy.debug,
            consoleProxy.info,
            consoleProxy.warn,
            consoleProxy.error
          ]
        );
        done();
        endTest(consoleProxy, system);
      }, 25);
    });

    it('an unknown low level should not call any console channel', done => {
      const [ consoleProxy, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.log(new LogEvent(LogLevel.OFF - 10, 'trace', 'A trace'));
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled(
          [],
          [
            consoleProxy.trace,
            consoleProxy.debug,
            consoleProxy.info,
            consoleProxy.warn,
            consoleProxy.error,
            consoleProxy.critical
          ]
        );
        done();
        endTest(consoleProxy, system);
      }, 25);
    });

    it('an unknown high level should call console critical channel', done => {
      const [ consoleProxy, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.log(new LogEvent(LogLevel.CRITICAL + 10, 'trace', 'A trace'));
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled(
          [consoleProxy.critical],
          [
            consoleProxy.trace,
            consoleProxy.debug,
            consoleProxy.info,
            consoleProxy.warn,
            consoleProxy.error
          ]
        );
        done();
        endTest(consoleProxy, system);
      }, 25);
    });
  });

  describe('When logToConsole is used with a console-proxy with single log channel', () => {
    const initTest = () => {
      const consoleProxy = {
        log: sinon.spy(function log () {})
      };
      const system = start(configureLogging(logToConsole(consoleProxy)));
      return [ consoleProxy, system ];
    };

    const endTest = (consoleProxy, system) => {
      stop(system);
    };

    it('off should not call any console channel', done => {
      const [ consoleProxy, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.off('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled([], [ consoleProxy.log ]);
        done();
      }, 25);
    });

    it('should call console trace channel', done => {
      const [ consoleProxy, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.trace('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled([ consoleProxy.log ], []);
        done();
        endTest(consoleProxy, system);
      }, 25);
    });

    it('should call console debug channel', done => {
      const [ consoleProxy, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.debug('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled([ consoleProxy.log ], []);
        done();
        endTest(consoleProxy, system);
      }, 25);
    });

    it('should call console info channel', done => {
      const [ consoleProxy, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.info('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled([ consoleProxy.log ], []);
        done();
        endTest(consoleProxy, system);
      }, 25);
    });

    it('should call console warn channel', done => {
      const [ consoleProxy, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.warn('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled([ consoleProxy.log ], []);
        done();
        endTest(consoleProxy, system);
      }, 25);
    });

    it('should call console error channel', done => {
      const [ consoleProxy, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.error('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled([ consoleProxy.log ], []);
        done();
        endTest(consoleProxy, system);
      }, 25);
    });

    it('should call console critical channel', done => {
      const [ consoleProxy, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.critical('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled([ consoleProxy.log ], []);
        done();
        endTest(consoleProxy, system);
      }, 25);
    });

    it('an unknown low level should not call any console channel', done => {
      const [ consoleProxy, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.log(new LogEvent(LogLevel.OFF - 10, 'trace', 'A trace'));
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled([], [ consoleProxy.log ]);
        done();
        endTest(consoleProxy, system);
      }, 25);
    });

    it('an unknown high level should call console critical channel', done => {
      const [ consoleProxy, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.log(new LogEvent(LogLevel.CRITICAL + 10, 'trace', 'A trace'));
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled([ consoleProxy.log ], []);
        done();
        endTest(consoleProxy, system);
      }, 25);
    });
  });

  describe('When logToConsole is used with the globals console', () => {
    const initTest = () => {
      const consoleStubs = {
        log: sinon.stub(console, 'log'),
        trace: sinon.stub(console, 'trace'),
        debug: sinon.stub(console, 'debug'),
        info: sinon.stub(console, 'info'),
        warn: sinon.stub(console, 'warn'),
        error: sinon.stub(console, 'error')
      };
      const system = start(configureLogging(logToConsole()));
      return [ consoleStubs, system ];
    };

    const closeTests = (consoleStubs, system) => {
      Object.values(consoleStubs).forEach(stub => stub.restore());
      stop(system);
    };

    it('off should not call any console channel', done => {
      const [ consoleStubs, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.off('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled(
          [],
          [
            consoleStubs.log,
            consoleStubs.trace,
            consoleStubs.debug,
            consoleStubs.info,
            consoleStubs.warn,
            consoleStubs.error
          ]
        );
        done();
        closeTests(consoleStubs, system);
      }, 25);
    });

    it('should call console trace channel', done => {
      const [ consoleStubs, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.trace('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled(
          [ consoleStubs.trace ],
          [
            consoleStubs.log,
            consoleStubs.debug,
            consoleStubs.info,
            consoleStubs.warn,
            consoleStubs.error
          ]
        );
        done();
        closeTests(consoleStubs, system);
      }, 25);
    });

    it('should call console debug channel', done => {
      const [ consoleStubs, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.debug('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled(
          [consoleStubs.debug],
          [
            consoleStubs.log,
            consoleStubs.trace,
            consoleStubs.info,
            consoleStubs.warn,
            consoleStubs.error
          ]
        );
        done();
        closeTests(consoleStubs, system);
      }, 25);
    });

    it('should call console info channel', done => {
      const [ consoleStubs, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.info('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled(
          [consoleStubs.info],
          [
            consoleStubs.log,
            consoleStubs.trace,
            consoleStubs.debug,
            consoleStubs.warn,
            consoleStubs.error
          ]
        );
        done();
        closeTests(consoleStubs, system);
      }, 25);
    });

    it('should call console warn channel', done => {
      const [ consoleStubs, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.warn('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled(
          [consoleStubs.warn],
          [
            consoleStubs.log,
            consoleStubs.trace,
            consoleStubs.debug,
            consoleStubs.info,
            consoleStubs.error
          ]
        );
        done();
        closeTests(consoleStubs, system);
      }, 25);
    });

    it('should call console error channel', done => {
      const [ consoleStubs, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.error('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled(
          [consoleStubs.error],
          [
            consoleStubs.log,
            consoleStubs.trace,
            consoleStubs.debug,
            consoleStubs.info,
            consoleStubs.warn
          ]
        );
        done();
        closeTests(consoleStubs, system);
      }, 25);
    });

    it('should call console critical channel', done => {
      const [ consoleStubs, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.critical('A trace');
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled(
          [consoleStubs.error],
          [
            consoleStubs.log,
            consoleStubs.trace,
            consoleStubs.debug,
            consoleStubs.info,
            consoleStubs.warn
          ]
        );
        done();
        closeTests(consoleStubs, system);
      }, 25);
    });

    it('an unknown low level should not call any console channel', done => {
      const [ consoleStubs, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.log(new LogEvent(LogLevel.OFF - 10, 'trace', 'A trace'));
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled(
          [],
          [
            consoleStubs.log,
            consoleStubs.trace,
            consoleStubs.debug,
            consoleStubs.info,
            consoleStubs.warn,
            consoleStubs.error
          ]
        );
        done();
        closeTests(consoleStubs, system);
      }, 25);
    });

    it('an unknown high level should call console critical channel', done => {
      const [ consoleStubs, system ] = initTest();
      const actor = spawnStateless(system, (msg, ctx) => {
        ctx.log.log(new LogEvent(LogLevel.CRITICAL + 10, 'trace', 'A trace'));
      });
      dispatch(actor, 'hello');
      setTimeout(() => {
        testCalled(
          [consoleStubs.error],
          [
            consoleStubs.log,
            consoleStubs.trace,
            consoleStubs.debug,
            consoleStubs.info,
            consoleStubs.warn
          ]
        );
        done();
        closeTests(consoleStubs, system);
      }, 25);
    });
  });
});