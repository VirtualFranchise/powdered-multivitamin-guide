(function(){
  var form=document.getElementById('fitcheck'); if(!form) return;
  var steps=[].slice.call(form.querySelectorAll('fieldset'));
  var i=0, started=false;
  var next=document.getElementById('next'), back=document.getElementById('back');
  var bar=document.getElementById('bar'), err=document.getElementById('err'), out=document.getElementById('result');
  var count=document.getElementById('stepcount');
  function track(name,params){ if(window.gtag){ gtag('event',name,params||{}); } }
  function show(){
    steps.forEach(function(s,k){ s.classList.toggle('hidden',k!==i); });
    back.classList.toggle('hidden',i===0);
    next.textContent = i===steps.length-1 ? 'See my result' : 'Next';
    bar.style.width = (i/steps.length*100)+'%';
    count.textContent='Question '+(i+1)+' of '+steps.length;
    err.textContent='';
  }
  function answered(s){ return s.querySelector('input:checked'); }
  form.addEventListener('change',function(e){
    if(e.target.name==='q5'){
      var boxes=form.querySelectorAll('input[name=q5]');
      if(e.target.value==='none' && e.target.checked){ boxes.forEach(function(b){ if(b.value!=='none') b.checked=false; }); }
      else if(e.target.checked){ form.querySelector('input[name=q5][value=none]').checked=false; }
      return;
    }
    // auto-advance on single-choice questions
    if(e.target.type==='radio' && i<steps.length-1){ setTimeout(function(){ go(); },180); }
  });
  back.addEventListener('click',function(){ if(i>0){ i--; show(); } });
  next.addEventListener('click',go);
  function go(){
    if(!answered(steps[i])){ err.textContent='Please choose an answer to continue.'; return; }
    if(!started){ started=true; track('quiz_start'); }
    if(i<steps.length-1){ i++; show(); var f=steps[i].querySelector('input'); if(f) f.focus(); return; }
    finish();
  }
  function val(n){ var el=form.querySelector('input[name='+n+']:checked'); return el?el.value:''; }
  function li(t){ return '<li>'+t+'</li>'; }
  function finish(){
    var flags=[].slice.call(form.querySelectorAll('input[name=q5]:checked')).map(function(b){return b.value;}).filter(function(v){return v!=='none';});
    var notes=[], level='good';
    var ask={
      pregnant:'Pregnancy or breastfeeding: ask your doctor. Prenatal formulas are designed for this stage.',
      meds:'Prescription medicine: show your pharmacist the full ingredient list. Calcium and magnesium need spacing from thyroid medicine, some antibiotics and bone medicines, and blood thinners need a doctor\'s OK first. <a href="safety.html#medications">Timing guide</a>.',
      organs:'Kidney disease, liver disease or gout: ask your doctor first. The label lists 60 mg of niacin (NIH\'s supplement upper limit is 35 mg) plus magnesium and potassium.',
      upcoming:'Surgery or blood tests: tell your doctor about all supplements, including the biotin and pine bark extract in this one.',
      smoker:'Smoking history: the vitamin A here is beta-carotene, and high-dose beta-carotene raised lung cancer risk in smokers in two large trials. Ask your doctor.',
      minor:'Under 18: ask a pediatrician before giving an adult supplement.',
      iron:'Iron: iron is not on the label, so this would not replace an iron supplement your doctor recommended.'
    };
    flags.forEach(function(f){ notes.push(ask[f]); });
    function soften(){ if(level==='good') level='maybe'; }
    if(flags.some(function(f){return f!=='iron';})) level='stop';
    if(flags.indexOf('iron')>-1) soften();
    if(val('q3')==='limit'){ soften(); notes.push('Sugar: each packet has 6 g of sugars (5 g added). Check with your doctor or dietitian.'); }
    if(val('q3')==='prefer-not'){ soften(); notes.push('Sweetness: the drink is sweetened. An unsweetened tablet may suit you better.'); }
    if(val('q4')==='no'){ soften(); notes.push('Routine: a packet only helps if you drink it. If a daily drink won\'t happen, a tablet may be more realistic.'); }
    if(val('q6')==='minerals'){ soften(); notes.push('Minerals: one packet gives about 44% of the adult calcium RDA and 30% of magnesium, so food or other sources still matter for those.'); }
    var plus=[];
    if(val('q2')==='avoid') plus.push('No pills to swallow: you stir the powder into water.');
    if(val('q1')==='many') plus.push('Fewer bottles: one packet combines four Isotonix® formulas.');
    if(val('q6')==='simple') plus.push('One step a day.');
    if(val('q6')==='travel') plus.push('Pre-portioned stick packs travel well.');
    if(val('q6')==='forms') plus.push('Active forms: the label lists methylcobalamin (B12), 5-MTHF (folate) and pyridoxal-5-phosphate (B6).');
    if(val('q4')==='yes') plus.push('A morning drink fits your routine.');
    var title={good:'Fits your routine. No flags from these 6 questions.',maybe:'Could work, with a trade-off or two',stop:'Ask your doctor or pharmacist first'}[level];
    var tag={good:'Good fit',maybe:'Possible fit',stop:'Check first'}[level];
    var html='<div class="result '+level+'" tabindex="-1" id="res"><span class="verdict">'+tag+'</span><h2 style="margin-top:0">'+title+'</h2>';
    var fitsH=plus.length?'<h3>What fits</h3><ul>'+plus.map(li).join('')+'</ul>':'';
    var checkH=notes.length?'<h3>What to check</h3><ul>'+notes.map(li).join('')+'</ul>':'';
    html+= level==='stop' ? checkH+fitsH : fitsH+checkH;
    if(level==='stop'){
      html+='<p>Take the <a href="safety.html">safety checklist</a> and <a href="nutrient-breakdown.html">ingredient table</a> to your doctor or pharmacist. If they say yes:</p><p>'+document.getElementById('buy-link-soft').innerHTML+'</p>';
    } else {
      html+='<h3>Your next step</h3><p>'+document.getElementById('buy-link').innerHTML+'</p><ol class="steps light"><li><div><b>Open the product page</b><span>The button opens it in my MarketAmerica.com store.</span></div></li><li><div><b>Pick one-time or subscription</b><span>Subscriptions arrive every 30 days.</span></div></li><li><div><b>Stir one into water daily</b><span>8 oz of water, once a day.</span></div></li></ol>';
    }
    html+='</div>';
    out.innerHTML=html; out.classList.remove('hidden'); form.classList.add('hidden');
    // keep sticky bar hidden on result (quiz-open stays)
    var r=document.getElementById('res'); r.focus({preventScroll:false});
    track('quiz_complete');
  }
  show();
})();
