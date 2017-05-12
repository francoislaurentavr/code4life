var read = ()=>readline().split(' '),
    pos=a=>+a>0?+a:0,
    abcde = (a,b,c,d,e)=>({
        a:pos(a),b:pos(b),c:pos(c),d:pos(d),e:pos(e),
        tot:function(){return this.a+this.b+this.c+this.d+this.e;},
        firstPos:function(){
            var r = false;
            if(this.e>0) r='e';
            if(this.d>0) r='d';
            if(this.c>0) r='c';
            if(this.b>0) r='b';
            if(this.a>0) r='a';
            return r;
        }
    }),
    difabcde=(a,b)=>abcde(a.a-b.a,a.b-b.b,a.c-b.c,a.d-b.d,a.e-b.e),
    addabcde=(a,b)=>abcde(a.a+b.a,a.b+b.b,a.c+b.c,a.d+b.d,a.e+b.e),
    minabcde=(a,b)=>abcde(Math.min(a.a,b.a),Math.min(a.b,b.b),Math.min(a.c,b.c),Math.min(a.d,b.d),Math.min(a.e,b.e)),
    readArr=(func)=>[...Array(+readline())].map(a=>func()),
    robot = ()=>{
        var t,e,s,sa,sb,sc,sd,se,ea,eb,ec,ed,ee;
        [t,e,s,sa,sb,sc,sd,se,ea,eb,ec,ed,ee] = read();
        return {
            target:t,
            eta: +e,
            score:+s,
            storage:abcde(sa,sb,sc,sd,se),
            expertise:abcde(ea,eb,ec,ed,ee)
        };
    },
    rabcde=()=>abcde(...read()),
    sample= ()=>{
        var sid,prop,rank,exp,health,a,b,c,d,e;
        [sid,prop,rank,exp,health,a,b,c,d,e]=read();
        return {
            id:+sid,
            prop:+prop,
            rank:+rank,
            exp:exp,
            health:+health,
            cost:abcde(a,b,c,d,e)
        };
    },
    modules={diag:'DIAGNOSIS',mol:'MOLECULES',lab:'LABORATORY',samp:'SAMPLES'},
    readGame = ()=>{
        return {
            me:robot(),
            other:robot(),
            availlables:rabcde(),
            samples:readArr(sample),
            filtSample:function(prop){return this.samples.filter(s=>s.prop===prop)},
            carSamples:function(){return this.filtSample(0);},
            availSamples:function(){return this.filtSample(-1)}
        };
    },
    goto=(mod)=>print('GOTO',mod),
    connect=(o)=>print('CONNECT',(''+o).toUpperCase()),
    debug=(o)=>printErr(JSON.stringify(o)),
    findTake=(samp,storage,expertise,avail)=>{
        var need = difabcde(samp.cost,addabcde(storage,expertise)),
            totneed = need.tot();
        if(totneed >0){
            var needAndAvail = minabcde(need,avail),
                toTake = needAndAvail.firstPos(),
                needAvailTot = needAndAvail.tot();
            if(needAvailTot < totneed || needAvailTot + storage.tot() > 10){
                //tout n'est pas dispo pour ce sample, check others
                return false;
            }
            return toTake;
        }else{
            return true;
        }
    };

//  Init
var projects = readArr(rabcde);

var steps=["takeSample","diag","takeMol","lab"],
    step = steps[0],
    nextStep=()=>{step = steps[(steps.indexOf(step)+1)%steps.length]};

while (true) {
    var game = readGame();
    var carSample = game.carSamples().sort((a,b)=>a.rank-b.rank),
        target = game.me.target;

    debug({step:step});
    debug({me:game.me});
    debug({carSample:carSample});
    switch(step){
        case steps[0]:

            if(target != modules.samp || game.me.eta !=0){
                goto(modules.samp);
            }else{
                if(carSample.length < 3){
                    connect(2);//(carSample.length >0 && carSample[0].rank==2) ? 1:2);
                }else{
                    nextStep();
                    goto(modules.diag);
                }
            }
            break;
        case steps[1]:
            if(target  != modules.diag || game.me.eta !=0){
                goto(modules.diag);
            }else{
                var toDiag = carSample.filter(a=>a.cost.tot()==0);
                if(toDiag.length >0){
                    connect(toDiag[0].id);
                }else{
                    nextStep();
                    goto(modules.mol);
                }
            }
            break;
        case steps[2]:
            if(target != modules.mol || game.me.eta !=0){
                goto(modules.mol);
            }else{
                var ok = false, oneFinish=false;
                for(var i = 0; i < carSample.length;i++){
                    var toTake = findTake(carSample[i],game.me.storage,game.me.expertise, game.availlables);
                    if(toTake === true){
                        oneFinish = true;
                    }else if(toTake !== false){
                        connect(toTake);
                        ok = true;
                        break;
                    }
                }
                if(!ok){
                    printErr("nothing to take :(");
                    if(oneFinish){
                        nextStep();
                        goto(modules.lab);
                    }else if(carSample.length < 3) {
                        step = steps[0];
                        goto(modules.samp);
                    }else {
                        if(game.other.target == modules.lab){
                            print('WAIT');
                        }else {
                            step = 'removeSample';
                            goto(modules.diag);
                        }
                    }
                }
            }
            break;
        case steps[3]:
            if(target != modules.lab || game.me.eta !=0){
                goto(modules.lab);
            }else{
                if(carSample.length>0){
                    var ok2=false;
                    for(var j = 0; j < carSample.length;j++) {
                        if (difabcde(carSample[j].cost, addabcde(game.me.storage,game.me.expertise)).tot() == 0) {
                            connect(carSample[j].id);
                            ok2 = true;
                            break;
                        }
                    }
                    if(!ok2){
                        step = 'takeMol';
                        goto(modules.mol);
                    }
                }
                else
                {
                    nextStep();
                    goto(modules.samp);
                }
            }
            break;
        case 'removeSample':
            if(target  != modules.diag || game.me.eta !=0){
                goto(modules.diag);
            }else {
                connect(carSample[0].id);
                step = 'takeSample';
            }
            break;
    }
}