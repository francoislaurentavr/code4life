/**
 * Bring data on patient samples from the diagnosis machine to the laboratory with enough molecules to produce medicine!
 **/

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
    modules={diag:'DIAGNOSIS',mol:'MOLECULES',lab:'LABORATORY'},
    readGame = ()=>{ 
        return {            
          me:robot(),
          other:robot(),
          availlables:rabcde(),
          samples:readArr(sample),
          filtSample:function(prop){return this.samples.filter(s=>s.prop===prop)},
          carSample:function(){var s=this.filtSample(0);return s.length>0?s[0]:false},
          availSamples:function(){return this.filtSample(-1)}      
        };
    },
    goto=(mod)=>print('GOTO',mod),
    connect=(o)=>print('CONNECT',(''+o).toUpperCase()),
    debug=(o)=>printErr(JSON.stringify(o));

//  Init
var projects = readArr(rabcde);


// game loop
while (true) {
    // for (var i = 0; i < 2; i++) {
    //     var inputs = readline().split(' ');
    //     var target = inputs[0];
    //     var eta = parseInt(inputs[1]);
    //     var score = parseInt(inputs[2]);
    //     var storageA = parseInt(inputs[3]);
    //     var storageB = parseInt(inputs[4]);
    //     var storageC = parseInt(inputs[5]);
    //     var storageD = parseInt(inputs[6]);
    //     var storageE = parseInt(inputs[7]);
    //     var expertiseA = parseInt(inputs[8]);
    //     var expertiseB = parseInt(inputs[9]);
    //     var expertiseC = parseInt(inputs[10]);
    //     var expertiseD = parseInt(inputs[11]);
    //     var expertiseE = parseInt(inputs[12]);
    // }
    // var inputs = readline().split(' ');
    // var availableA = parseInt(inputs[0]);
    // var availableB = parseInt(inputs[1]);
    // var availableC = parseInt(inputs[2]);
    // var availableD = parseInt(inputs[3]);
    // var availableE = parseInt(inputs[4]);
    // var sampleCount = parseInt(readline());
    // for (var i = 0; i < sampleCount; i++) {
    //     var inputs = readline().split(' ');
    //     var sampleId = parseInt(inputs[0]);
    //     var carriedBy = parseInt(inputs[1]);
    //     var rank = parseInt(inputs[2]);
    //     var expertiseGain = inputs[3];
    //     var health = parseInt(inputs[4]);
    //     var costA = parseInt(inputs[5]);
    //     var costB = parseInt(inputs[6]);
    //     var costC = parseInt(inputs[7]);
    //     var costD = parseInt(inputs[8]);
    //     var costE = parseInt(inputs[9]);
    // }
    // Write an action using print()
    // To debug: printErr('Debug messages...');
    
    var game = readGame();
    //printErr(JSON.stringify(game));
    var    carSample = game.carSample(),
        target = game.me.target;
        
    if(!carSample){
        if(target != modules.diag){
            goto(modules.diag);
        }else{
            var samps = game.availSamples().sort((a,b)=>b.health-a.health);
            if(samps.length >0){
                
                connect(samps[0].id);
            }else{
                //what to do here ???
                
                printErr("no sample to take :(")
                goto(modules.diag);
            }
        }
    }else{
        //carSample ok
        var need = difabcde(carSample.cost,game.me.storage),
            totneed = need.tot();
            
            debug(need);
            debug(totneed);
        if(totneed >0){
            if(target != modules.mol){
                goto(modules.mol);   
            }else{
                var needAndAvail = minabcde(need,game.availlables),
                    toTake = needAndAvail.firstPos();
                debug(needAndAvail);
                debug(toTake);
                if(toTake !== false){
                    connect(toTake);                    
                }else{                    
                    printErr("nothing to take :(");
                    goto(modules.diag);
                }
            }            
        }else{
            if(target != modules.lab){
                goto(modules.lab);
            }else{
                connect(carSample.id);
            }
        }        
    }    
}