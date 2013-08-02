;(function (UI, undefined) {
  var base = UI.base;
    var defaultConfig = {
        director: function (e) { }, //导演
        duration: 0, //时长
        step: 0, //每秒多少帧
        onStart: function (e) { }, //动画开始时调用的回调
        onStop: function (e) { }, //动画结束时调用的回调
        onContinue: function (e) { }, //动画继续时调用的函数
        onPause: function (e) { }, //动画暂停时调用的函数
        setting: base, //帧内运行环境
        loop: false//是否循环
    };

    var STOP = 0, RUN = 1, PAUSE = 2;
    var ClassObj = function (config) {
        var self = this;
        // factory or constructor
        if (!(self instanceof ClassObj)) {
            return new ClassObj(base.merge(defaultConfig, config));
        }
        this.config = base.merge(defaultConfig, config);
        this.Env = {
            steps: 0,
            curStep: 0,
            interval: 0,
            static: 0,
            plan: 0,
            time: new Date()
        };
        this.Scene = {
            globe: [],
            stepAct: {}
        };
        this.Guid = "TAxis" + ~ ~(new Date());
        this.config.setting = this;
        this.Timers = {};
        this.stepsTotle = 0;
        this.startDate = new Date();
        this.steps = 0;
        init.call(this);
        this.prevStepDate = new Date();
        this.prevStepRun = 0;

    }
    var init = function () {
        if (this.config.duration) {
            this.Env.steps = this.config.duration * this.config.step;
            if (this.Env.steps < 1) {
                this.Env.steps = 1
            }
        } else {
            this.Env.steps = "auto";
        }
        this.Env.interval = 1000 / this.config.step;
    }

    var runScene = function () {

        var me = this;
        this.Env.curStep++;
        var flgJump = false;
        this.stepsTotle++;
        if (((new Date).getTime() - this.startDate.getTime()) >= 1000) {
            this.steps = this.stepsTotle;
            this.startDate = new Date();
            this.stepsTotle = 0;
        }
        this.prevStepRun = (new Date).getTime() - this.prevStepDate.getTime();

        this.Env.plan = this.Env.curStep / this.Env.steps;

        clearTimeout(me.Timers[me.Guid]);
        me.config.director.call(me.config.setting, this.Env);

        if (this.config.loop && this.Env.curStep >= this.Env.steps) {
            this.Env.curStep = 1;
        }
        if ((this.Env.curStep < this.Env.steps || this.Env.steps == "auto") && this.Env.static == RUN) {
            //me.nextStep = true; 
            /*if (this.prevStepRun > this.Env.interval) {
                var jumpStep = Math.ceil((this.prevStepRun - this.Env.interval) / this.Env.interval);
                this.Env.curStep += jumpStep;
                this.stepsTotle -= jumpStep;
                this.Env.curStep = this.Env.curStep >= this.Env.steps ? this.Env.steps - 1 : this.Env.curStep;
                flgJump = true;
            }*/
            clearTimeout(me.Timers[me.Guid]);
            //var requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
            //if (requestAnimationFrame) {
                //me.Timers[me.Guid] = requestAnimationFrame(function () { runScene.call(me); }, this.Env.interval);
            //} else {
                me.Timers[me.Guid] = setTimeout(function () { runScene.call(me); }, this.Env.interval);
            //}

        } else {
            this.Env.static = STOP;
			

        }
        if (!flgJump) {

            base.each(this.Scene.globe, function (i) {
                i.call(me.config.setting, me.Env);

            })
            if (this.Scene.stepAct["step_" + this.Env.curStep]) {
                base.each(this.Scene.stepAct["step_" + this.Env.curStep], function (i) {
                    i.call(me.config.setting, me.Env);
                })
            }
        }
        if (this.Env.static === STOP) {
            if (this.config.onStop) {
                this.config.onStop.call(me, this.Env);
            }
        }
        this.prevStepDate = new Date();
    }
    var setStatic = function (s) {
        this.Env.static = s;
    }
    var checkStepNum = function (s) {
        if (s < 0) {
            return 0;
        } else if (s > this.Env.steps) {
            return this.Env.steps;
        } else if (s == "end") {
            return this.Env.steps;
        }
        return s;
    }

    ClassObj.prototype={
        action: function () {
            setStatic.call(this, RUN);
            this.Env.curStep = 0;
            this.Env.time = new Date();
            this.config.onStart.call(this, this.Env);
            this.startDate = new Date();
            this.nextStep = false;
            this.steps = 0;
            this.prevStepDate = new Date();
            this.prevStepRun = 0;
            runScene.call(this);

        },
        getSteps: function (callback) {
            this.addScene(function () { callback(this.steps); });
        },
        getScene: function () {
            return this.Scene;
        },
        addScene: function (fn, s, e) {
            if (!s) {
                this.Scene.globe.push(fn);
            } else {
                s = checkStepNum.call(this, s);

                e = e || s;
                if (e == "end") {
                    this.Scene.stepAct["step_" + s] = this.Scene.stepAct["step_" + s] || [];
                    this.Scene.stepAct["step_" + s].push(function () {
                        this.Scene.globe.push(fn); fn.call(this.config.setting, this.Env);
						
                    });
                } else {
                    for (var i = s; i <= e; i++) {
                        this.Scene.stepAct["step_" + i] = this.Scene.stepAct["step_" + i] || [];
                        this.Scene.stepAct["step_" + i].push(fn);
						
                    }
                }
            }
        },
		clearScene:function(){
			this.Scene.globe=null;
			this.Scene.stepAct=null;
			this.Scene.globe=[];
			this.Scene.stepAct=[];
		},
        goto: function (go) {
            go = checkStepNum.call(this, go);
            this.Env.curStep = go - 1;
            //setStatic.call(this, STOP);
            clearTimeout(this.Timers[this.Guid]);
            runScene.call(this);
        },
        stop: function () {
            setStatic.call(this, STOP);
            this.config.onPause.call(this, this.Env);
            clearTimeout(this.Timers[this.Guid]);
        },
        goOn: function () {
            if (this.Env.curStep < this.Env.steps) {
                setStatic.call(this, RUN);
                this.config.onContinue.call(this, this.Env);
                runScene.call(this);
            }
        },
        setConfig: function (cfg) {
            this.config = base.merge(this.config, cfg);
            init.call(this);
        },
        clearScene: function () {
            this.Scene.stepAct = {};
            this.Scene.globe = [];
        }
    };
    base.TimerAxis = ClassObj;

})(UIBASE);
