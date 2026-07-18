const STORAGE='zero17-coach-v04';
const PREVIOUS_STORAGE='zero17-coach-v03';
const PREVIOUS_STORAGE_2='zero17-coach-v02';
const OLD_STORAGE='zero17-coach-v01';
const DAYS=['Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira'];
const METHODS=['Normal','Bi-set','Tri-set','Drop-set','Progressão','Rest pause','Aquecimento'];
const kairaDefaults={
 'Segunda-feira':{name:'Inferiores',items:[{name:'Agachamento livre',sets:'5x',method:'Normal',done:false},{name:'Búlgaro',sets:'3x',method:'Normal',done:false},{name:'Glúteo coice + Step Up',sets:'3x',method:'Bi-set',done:false},{name:'Afundo',sets:'3x',method:'Normal',done:false}]},
 'Terça-feira':{name:'Superior — Bi-set',items:[{name:'Barra fixa + Crucifixo',sets:'3x',method:'Bi-set',done:false},{name:'Puxada alta aberta + Flexão',sets:'3x',method:'Bi-set',done:false},{name:'Elevação lateral + Rosca barra W',sets:'3x',method:'Bi-set',done:false},{name:'Desenvolvimento barra + Tríceps corda',sets:'3x',method:'Bi-set',done:false},{name:'Abdômen infra no cross + Abdômen total',sets:'3x',method:'Bi-set',done:false}]},
 'Quarta-feira':{name:'Glúteos',items:[{name:'Elevação pélvica',sets:'1 + 3',method:'Progressão',done:false},{name:'Agachamento sumô',sets:'4x',method:'Drop-set',done:false},{name:'Abdutora articulada',sets:'4x',method:'Normal',done:false},{name:'Glúteo perna estendida',sets:'4x',method:'Normal',done:false}]},
 'Quinta-feira':{name:'Superior — Bi-set',items:[{name:'Supino reto + Puxada alta articulada',sets:'3x',method:'Bi-set',done:false},{name:'Supino inclinado com halteres + Remada curvada',sets:'3x',method:'Bi-set',done:false},{name:'Tríceps no banco + Bíceps na corda verde',sets:'3x',method:'Bi-set',done:false},{name:'Tríceps corda + Rosca martelo inclinado',sets:'3x',method:'Bi-set',done:false}]},
 'Sexta-feira':{name:'Inferiores',items:[{name:'Leg Press',sets:'2 aquecimentos + 3x',method:'Progressão',done:false},{name:'Afundo com barra + Afundo livre',sets:'3x',method:'Bi-set',done:false},{name:'Extensora',sets:'3x de 10–12',method:'Normal',done:false},{name:'Abdução + Coice no cross',sets:'3x de 10–12',method:'Bi-set',done:false}]}
};
const demoWorkout={};
DAYS.forEach(d=>demoWorkout[d]={name:'Treino de teste',items:[{name:'Exercício 1',sets:'3x',method:'Normal',done:false},{name:'Exercício 2 + Exercício 3',sets:'3x',method:'Bi-set',done:false},{name:'Exercício 4',sets:'4x',method:'Progressão',done:false}]});
const defaults={times:{'18:00':[
 {id:'kaira',name:'Kaira',workouts:kairaDefaults,finished:{}},
 {id:'aluno-teste-1',name:'Aluno teste 1',workouts:structuredClone(demoWorkout),finished:{}},
 {id:'aluno-teste-2',name:'Aluno teste 2',workouts:structuredClone(demoWorkout),finished:{}}
]},ui:{time:'18:00',openId:'kaira',studentDays:{kaira:'Segunda-feira','aluno-teste-1':'Segunda-feira','aluno-teste-2':'Segunda-feira'}}};
function clone(v){return JSON.parse(JSON.stringify(v))}
function load(){
 try{
  const saved=localStorage.getItem(STORAGE); if(saved)return normalize(JSON.parse(saved));
  const previous=localStorage.getItem(PREVIOUS_STORAGE);
  if(previous)return normalize(JSON.parse(previous));
  const previous2=localStorage.getItem(PREVIOUS_STORAGE_2);
  if(previous2)return normalize(JSON.parse(previous2));
  const old=localStorage.getItem(OLD_STORAGE);
  if(old){const migrated=clone(defaults);migrated.times['18:00'][0].workouts=JSON.parse(old);return normalize(migrated)}
 }catch(e){}
 return normalize(clone(defaults))
}
function normalize(value){
 value.ui=value.ui||{};
 value.ui.time=value.ui.time||'18:00';
 value.ui.studentDays=value.ui.studentDays||{};
 Object.values(value.times||{}).flat().forEach(student=>{
  if(!value.ui.studentDays[student.id])value.ui.studentDays[student.id]=value.ui.day||'Segunda-feira';
 });
 delete value.ui.day;
 return value;
}
let data=load();let editing=null;let editingDay=null;let managingStudent=null;
const timeSelect=document.getElementById('timeSelect'),grid=document.getElementById('studentGrid'),studentCount=document.getElementById('studentCount');
const overlay=document.getElementById('overlay'),drawer=document.getElementById('drawer'),drawerTitle=document.getElementById('drawerTitle'),editList=document.getElementById('editList');
const workoutTitleInput=document.getElementById('workoutTitleInput'),studentDrawer=document.getElementById('studentDrawer'),studentDrawerTitle=document.getElementById('studentDrawerTitle'),studentNameInput=document.getElementById('studentNameInput'),studentTimeInput=document.getElementById('studentTimeInput'),deleteStudentZone=document.getElementById('deleteStudentZone');
function refreshTimeOptions(preferred){
 timeSelect.innerHTML='';Object.keys(data.times).sort().forEach(t=>timeSelect.add(new Option(t,t)));
 const choice=preferred||data.ui.time||Object.keys(data.times)[0];timeSelect.value=data.times[choice]?choice:Object.keys(data.times)[0];
}
refreshTimeOptions();
function save(){localStorage.setItem(STORAGE,JSON.stringify(data))}
function students(){return data.times[timeSelect.value]||[]}
function selectedDay(student){return data.ui.studentDays[student.id]||'Segunda-feira'}
function workout(student,day=selectedDay(student)){return student.workouts[day]||{name:'Sem treino',items:[]}}
function percent(w){const total=w.items.length,done=w.items.filter(x=>x.done).length;return {total,done,p:total?Math.round(done/total*100):0}}
function render(){
 data.ui.time=timeSelect.value;save();grid.innerHTML='';const arr=students();studentCount.textContent=`${arr.length} ${arr.length===1?'aluno':'alunos'} neste horário`;
 if(!arr.length){grid.innerHTML='<div class="empty">Nenhum aluno cadastrado neste horário.</div>';return}
 arr.forEach(student=>{
  const day=selectedDay(student),w=workout(student,day),pr=percent(w),isOpen=data.ui.openId===student.id,doneInfo=student.finished?.[day];
  const card=document.createElement('section');card.className='card'+(isOpen?' open':'')+(doneInfo?' completed':'');
  card.innerHTML=`<button class="head"><div><div class="name"></div><div class="workout"></div></div><div class="summary"><div class="summary-line"></div><div class="bar"><span></span></div></div></button><div class="body"><div class="student-day"><label>Treino deste aluno</label><select class="individual-day" aria-label="Treino do aluno"></select></div><div class="list"></div><div class="actions"><button class="btn manage-student">Editar aluno</button><button class="btn edit">Editar treino</button><button class="btn btn-green finish">${doneInfo?'Reabrir treino':'Finalizar treino'}</button><button class="btn reset">Reiniciar marcações</button></div><div class="status"></div></div>`;
  card.querySelector('.name').textContent=student.name;card.querySelector('.workout').textContent=`${day} • ${w.name}`;card.querySelector('.summary-line').textContent=doneInfo?`Concluído às ${doneInfo}`:`${pr.done} de ${pr.total} • ${pr.p}%`;card.querySelector('.bar span').style.width=pr.p+'%';
  card.querySelector('.head').onclick=()=>{data.ui.openId=isOpen?null:student.id;save();render()};
  const dayPicker=card.querySelector('.individual-day');DAYS.forEach(d=>dayPicker.add(new Option(d,d)));dayPicker.value=day;
  dayPicker.onchange=()=>{data.ui.studentDays[student.id]=dayPicker.value;data.ui.openId=student.id;save();render()};
  const list=card.querySelector('.list');
  w.items.forEach((it,i)=>{const row=document.createElement('div');row.className='exercise'+(it.done?' done':'');row.innerHTML='<button class="check"></button><div><div class="ex-name"></div><div class="ex-meta"></div></div><div class="tag"></div>';row.querySelector('.check').textContent=it.done?'✓':'';row.querySelector('.ex-name').textContent=it.name;row.querySelector('.ex-meta').textContent=it.sets;row.querySelector('.tag').textContent=it.method;row.querySelector('.check').onclick=()=>{it.done=!it.done;delete student.finished[day];save();render()};list.appendChild(row)});
  card.querySelector('.manage-student').onclick=()=>openStudentManager(student);
  card.querySelector('.edit').onclick=()=>openEditor(student,day);
  card.querySelector('.reset').onclick=()=>{w.items.forEach(x=>x.done=false);delete student.finished[day];save();render();showStatus(student.id,'Marcações reiniciadas.')};
  card.querySelector('.finish').onclick=()=>{if(doneInfo){delete student.finished[day];w.items.forEach(x=>x.done=false)}else{w.items.forEach(x=>x.done=true);student.finished[day]=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}save();render()};
  grid.appendChild(card)
 })
}
function showStatus(id,msg){setTimeout(()=>{const student=students().find(s=>s.id===id);const card=[...grid.querySelectorAll('.card')].find(c=>c.querySelector('.name')?.textContent===student?.name);if(card){const s=card.querySelector('.status');s.textContent=msg;s.classList.add('show')}},0)}
function openEditor(student,day){editing=student;editingDay=day;const current=workout(student,day);drawerTitle.textContent=`Editar treino — ${student.name} • ${day}`;workoutTitleInput.value=current.name==='Sem treino'?'':current.name;editList.innerHTML='';current.items.forEach(it=>addEditRow(it));overlay.classList.add('show');drawer.classList.add('show')}
function addEditRow(it={name:'',sets:'3x',method:'Normal'}){const row=document.createElement('div');row.className='edit-item';row.innerHTML='<div class="edit-grid"><input class="n" placeholder="Nome do exercício"><input class="s" placeholder="Séries"><select class="m"></select></div><button class="remove">Excluir</button>';row.querySelector('.n').value=it.name||'';row.querySelector('.s').value=it.sets||'';METHODS.forEach(m=>row.querySelector('.m').add(new Option(m,m)));row.querySelector('.m').value=it.method||'Normal';row.querySelector('.remove').onclick=()=>row.remove();editList.appendChild(row)}
function closeEditor(){overlay.classList.remove('show');drawer.classList.remove('show');editing=null;editingDay=null}
function emptyWeek(){const w={};DAYS.forEach(d=>w[d]={name:'Treino do dia',items:[]});return w}
function makeId(name){return (name||'aluno').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+Date.now()}
function openStudentManager(student=null){managingStudent=student;studentDrawerTitle.textContent=student?'Editar aluno':'Cadastrar aluno';studentNameInput.value=student?.name||'';studentTimeInput.value=student?findStudentTime(student.id):(timeSelect.value||'18:00');deleteStudentZone.style.display=student?'block':'none';overlay.classList.add('show');studentDrawer.classList.add('show');setTimeout(()=>studentNameInput.focus(),50)}
function closeStudentManager(){studentDrawer.classList.remove('show');overlay.classList.remove('show');managingStudent=null}
function findStudentTime(id){return Object.keys(data.times).find(t=>data.times[t].some(s=>s.id===id))||timeSelect.value}
function removeStudentFromTimes(id){Object.keys(data.times).forEach(t=>{data.times[t]=data.times[t].filter(s=>s.id!==id);if(!data.times[t].length)delete data.times[t]})}
document.getElementById('addExercise').onclick=()=>addEditRow();document.getElementById('closeDrawer').onclick=closeEditor;document.getElementById('cancelEdit').onclick=closeEditor;
document.getElementById('addStudentTop').onclick=()=>openStudentManager();document.getElementById('closeStudentDrawer').onclick=closeStudentManager;document.getElementById('cancelStudent').onclick=closeStudentManager;
overlay.onclick=()=>{if(drawer.classList.contains('show'))closeEditor();if(studentDrawer.classList.contains('show'))closeStudentManager()};
document.getElementById('saveEdit').onclick=()=>{if(!editing||!editingDay)return;const studentId=editing.id;const current=workout(editing,editingDay);current.name=workoutTitleInput.value.trim()||'Treino do dia';current.items=[...editList.querySelectorAll('.edit-item')].map(r=>({name:r.querySelector('.n').value.trim()||'Novo exercício',sets:r.querySelector('.s').value.trim(),method:r.querySelector('.m').value,done:false}));delete editing.finished[editingDay];save();closeEditor();render();showStatus(studentId,'Alterações salvas.')};
document.getElementById('saveStudent').onclick=()=>{
 const name=studentNameInput.value.trim(),newTime=studentTimeInput.value;if(!name){alert('Digite o nome do aluno.');studentNameInput.focus();return}if(!newTime){alert('Informe o horário.');return}
 let student=managingStudent;if(student){const oldTime=findStudentTime(student.id);student.name=name;if(oldTime!==newTime){data.times[oldTime]=data.times[oldTime].filter(s=>s.id!==student.id);if(!data.times[oldTime].length)delete data.times[oldTime];data.times[newTime]=data.times[newTime]||[];data.times[newTime].push(student)}}else{student={id:makeId(name),name,workouts:emptyWeek(),finished:{}};data.times[newTime]=data.times[newTime]||[];data.times[newTime].push(student);data.ui.studentDays[student.id]='Segunda-feira'}
 data.ui.time=newTime;data.ui.openId=student.id;save();closeStudentManager();refreshTimeOptions(newTime);render()
};
document.getElementById('deleteStudent').onclick=()=>{if(!managingStudent)return;if(!confirm(`Excluir ${managingStudent.name}? Esta ação remove os treinos deste aluno.`))return;const id=managingStudent.id;removeStudentFromTimes(id);delete data.ui.studentDays[id];if(data.ui.openId===id)data.ui.openId=null;if(!Object.keys(data.times).length)data.times['18:00']=[];const next=Object.keys(data.times).sort()[0];data.ui.time=next;save();closeStudentManager();refreshTimeOptions(next);render()};
timeSelect.onchange=()=>{data.ui.openId=students()[0]?.id||null;render()};
render();
