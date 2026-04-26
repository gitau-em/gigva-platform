'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const generateRefNumber = () => {
  const year = new Date().getFullYear()
  const num = String(Math.floor(10000 + Math.random() * 90000))
  return `REF-${year}-${num}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const today = new Date().toISOString().split('T')[0]

const defaultForm = {
  refNumber: generateRefNumber(),
  issueDate: today,
  letterType: 'Employment Reference',
  confidentiality: 'Confidential',
  orgName: 'Gigva Kenya', department: '', address: '', suburb: 'Nairobi', state: '', postcode: '', country: 'Kenya',
  phone: '', email: '', website: 'www.gigva.co.ke', abn: '',
  authorName: '', authorTitle: '', authorPhone: '', authorEmail: '',
  recipientType: 'whom', recipientName: '', recipientTitle: '', recipientOrg: '', recipientAddress: '',
  employeeName: '', employeeTitle: '', employeeDept: '', startDate: '', endDate: '',
  employmentType: 'Full-Time', employeeId: '',
  relationship: '', bodyText: '', recommendation: 'Highly Recommended', closingText: '',
  includeVerification: false,
  disclaimer: 'This reference letter is confidential and intended solely for the named addressee. The information is based on the author's professional assessment and experience working with the individual.',
  pageNumber: true,
}

const SECTIONS = [
  { id: 'reference', label: 'Reference Details', icon: '🔖' },
  { id: 'org', label: 'Organisation', icon: '🏢' },
  { id: 'author', label: 'Author / Signatory', icon: '✍️' },
  { id: 'recipient', label: 'Recipient', icon: '📬' },
  { id: 'employee', label: 'Employee Details', icon: '👤' },
  { id: 'body', label: 'Letter Body', icon: '📝' },
  { id: 'footer', label: 'Footer & Settings', icon: '⚙️' },
]

export default function ReferenceLetterPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [active, setActive] = useState('reference')
  const [saved, setSaved] = useState(false)
  const previewRef = useRef(null)

  // CTO-only auth check
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('gigva_token') : null
    if (!t) { router.push('/admin/login'); return }
    try {
      const payload = JSON.parse(atob(t.split('.')[1]))
      if (payload.role !== 'cto' && !payload.is_admin) {
        router.push('/admin/dashboard'); return
      }
      setUser(payload)
    } catch {
      router.push('/admin/login')
    }
    setAuthChecked(true)
  }, [])

  const update = (f, v) => {
    setForm(p => ({ ...p, [f]: v }))
    setSaved(false)
    setTimeout(() => setSaved(true), 300)
  }

  const handleReset = () => {
    setForm({ ...defaultForm, refNumber: generateRefNumber() })
    setSaved(false)
  }

  const handlePrint = () => {
    const printContent = previewRef.current?.innerHTML
    const win = window.open('', '_blank')
    win.document.write(`<html><head><title>Reference Letter - ${form.refNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
        body { margin: 0; padding: 40px; font-family: 'Times New Roman', Georgia, serif; font-size: 11pt; color: #111; }
        @media print { @page { size: A4; margin: 25mm; } body { padding: 0; } }
      </style></head>
      <body>${printContent}</body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  const handleDownloadPDF = () => {
    const printContent = previewRef.current?.innerHTML
    const win = window.open('', '_blank')
    win.document.write(`<html><head><title>Reference Letter - ${form.refNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
        body { margin: 0; padding: 0; font-family: 'Times New Roman', Georgia, serif; font-size: 11pt; color: #111; }
        @media print { @page { size: A4; margin: 20mm; } }
      </style>
      <script>window.onload = function(){ window.print(); setTimeout(()=>window.close(),1000); }<\/script>
      </head><body>${printContent}</body></html>`)
    win.document.close()
  }

  const bodyParagraph1 = () => {
    const name = form.employeeName || '[Employee Name]'
    const title = form.employeeTitle || '[Job Title]'
    const org = form.orgName || '[Organisation]'
    const rel = form.relationship || 'direct supervisor'
    const start = form.startDate ? formatDate(form.startDate) : '[Start Date]'
    const end = form.endDate ? formatDate(form.endDate) : 'present'
    const type = form.employmentType
    return `I am writing this letter in my capacity as ${rel} at ${org}. It is my great pleasure to provide this ${form.letterType.toLowerCase()} for ${name}, who has been employed as a ${type} ${title}${form.employeeDept ? ` within the ${form.employeeDept} department` : ''} from ${start}${form.endDate ? ` to ${end}` : ' to the present date'}.`
  }

  const bodyParagraph2 = () => {
    const name = form.employeeName ? form.employeeName.split(' ')[0] : 'They'
    return form.bodyText ||
      `${name} has consistently demonstrated a high level of professionalism, dedication, and a strong work ethic throughout their time with us. Their contributions have had a measurable positive impact on our team and operations.`
  }

  const closingPara = () => {
    const name = form.employeeName || 'this individual'
    if (form.recommendation === 'Highly Recommended')
      return form.closingText || `I recommend ${name} without reservation and am fully confident they will be an exceptional asset to any organisation fortunate enough to have them.`
    if (form.recommendation === 'Recommended')
      return form.closingText || `I am pleased to recommend ${name} and believe they have the capability and determination to succeed in their next role.`
    return form.closingText || `I recommend ${name} with the understanding that they are continuing to grow professionally and will benefit from the right opportunities.`
  }

  if (!authChecked || !user) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0b1120' }}>
      <div style={{ color:'#60a5fa', fontSize:'18px' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ fontFamily:"'DM Sans', system-ui, sans-serif", minHeight:'100vh', background:'#0b1120', color:'#e2e8f0', display:'flex', flexDirection:'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .fi { width:100%; background:#111f35; border:1px solid #1e3a5f; color:#e2e8f0; padding:7px 10px; border-radius:6px; font-size:12.5px; font-family:inherit; outline:none; transition:border-color 0.2s,box-shadow 0.2s; }
        .fi:focus { border-color:#3b82f6; box-shadow:0 0 0 2px rgba(59,130,246,0.15); }
        .fi::placeholder { color:#475569; }
        select.fi option { background:#111f35; }
        textarea.fi { resize:vertical; }
        .fl { display:block; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#64748b; margin-bottom:4px; }
        .sb { width:100%; text-align:left; background:none; border:none; color:#94a3b8; padding:9px 12px; border-radius:7px; cursor:pointer; font-size:12.5px; font-family:inherit; display:flex; align-items:center; gap:9px; transition:all 0.15s; }
        .sb:hover { background:#111f35; color:#e2e8f0; }
        .sb.act { background:linear-gradient(135deg,#1e3a8a,#1d4ed8); color:white; box-shadow:0 2px 8px rgba(29,78,216,0.3); }
        .ab { padding:8px 16px; border-radius:7px; border:none; cursor:pointer; font-size:12.5px; font-weight:600; font-family:inherit; transition:all 0.15s; display:flex; align-items:center; gap:6px; white-space:nowrap; }
        .badge { display:inline-flex; align-items:center; padding:2px 8px; border-radius:20px; font-size:10px; font-weight:700; }
        .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#0b1120; }
        ::-webkit-scrollbar-thumb { background:#1e3a5f; border-radius:4px; }
        .radio-row { display:flex; align-items:center; gap:6px; cursor:pointer; font-size:12.5px; color:#94a3b8; margin-bottom:6px; }
        .radio-row.sel { color:#60a5fa; }
        input[type=radio], input[type=checkbox] { accent-color:#3b82f6; width:14px; height:14px; cursor:pointer; }
      `}</style>

      {/* Top Bar */}
      <div style={{ background:'#0d1829', borderBottom:'1px solid #1e293b', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:200, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <button onClick={() => router.push('/admin/dashboard')} style={{ background:'none', border:'none', color:'#60a5fa', cursor:'pointer', fontSize:'13px', display:'flex', alignItems:'center', gap:'4px' }}>
            ← Dashboard
          </button>
          <span style={{ color:'#1e293b' }}>|</span>
          <div style={{ width:36, height:36, background:'linear-gradient(135deg,#1e3a8a,#3b82f6)', borderRadius:'9px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px' }}>📄</div>
          <div>
            <div style={{ fontFamily:"'Playfair Display', serif", fontSize:'16px', fontWeight:'700', color:'#f1f5f9', lineHeight:1.2 }}>Reference Letter Generator</div>
            <div style={{ fontSize:'10.5px', color:'#475569', letterSpacing:'0.04em' }}>STAFF PORTAL · HR ADMINISTRATION</div>
          </div>
          <span className="badge" style={{ background:'rgba(245,158,11,0.15)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.3)', marginLeft:'4px' }}>CTO Only</span>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          {saved && <span className="badge" style={{ background:'rgba(34,197,94,0.15)', color:'#4ade80', border:'1px solid rgba(74,222,128,0.2)' }}>✓ Auto-saved</span>}
          <span className="badge" style={{ background:'rgba(59,130,246,0.12)', color:'#60a5fa', border:'1px solid rgba(96,165,250,0.2)' }}>{form.refNumber}</span>
          <button className="ab" style={{ background:'#1e293b', color:'#94a3b8' }} onClick={handleReset}>↺ Reset</button>
          <button className="ab" style={{ background:'#0f4c81', color:'#bfdbfe' }} onClick={handlePrint}>🖨️ Print</button>
          <button className="ab" style={{ background:'linear-gradient(135deg,#1e3a8a,#2563eb)', color:'white', boxShadow:'0 2px 10px rgba(37,99,235,0.35)' }} onClick={handleDownloadPDF}>⬇ Download PDF</button>
        </div>
      </div>

      <div style={{ display:'flex', flex:1, overflow:'hidden', height:'calc(100vh - 57px)' }}>
        {/* Sidebar */}
        <div style={{ width:'190px', background:'#0d1829', borderRight:'1px solid #1e293b', padding:'14px 10px', flexShrink:0, overflowY:'auto' }}>
          <div style={{ fontSize:'9.5px', fontWeight:'700', color:'#334155', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px', paddingLeft:'12px' }}>Sections</div>
          {SECTIONS.map(s => (
            <button key={s.id} className={`sb ${active === s.id ? 'act' : ''}`} onClick={() => setActive(s.id)}>
              <span style={{ fontSize:'14px' }}>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Form Panel */}
        <div style={{ width:'360px', background:'#0f1923', borderRight:'1px solid #1e293b', overflowY:'auto', padding:'20px', flexShrink:0 }}>
          <div style={{ fontSize:'14px', fontWeight:'700', color:'#f1f5f9', marginBottom:'16px', paddingBottom:'10px', borderBottom:'1px solid #1e293b' }}>
            {SECTIONS.find(s => s.id === active)?.icon} {SECTIONS.find(s => s.id === active)?.label}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>

            {active === 'reference' && <>
              <F label="Reference Number"><input className="fi" value={form.refNumber} onChange={e => update('refNumber', e.target.value)} /></F>
              <F label="Date of Issue"><input className="fi" type="date" value={form.issueDate} onChange={e => update('issueDate', e.target.value)} /></F>
              <F label="Letter Type">
                <select className="fi" value={form.letterType} onChange={e => update('letterType', e.target.value)}>
                  {['Employment Reference','Character Reference','Academic Reference','Professional Reference'].map(v => <option key={v}>{v}</option>)}
                </select>
              </F>
              <F label="Confidentiality Level">
                <select className="fi" value={form.confidentiality} onChange={e => update('confidentiality', e.target.value)}>
                  {['Strictly Confidential','Confidential','Not Confidential'].map(v => <option key={v}>{v}</option>)}
                </select>
              </F>
              <div style={{ background:'#111f35', border:'1px solid #1e3a5f', borderRadius:'8px', padding:'10px 12px', fontSize:'11.5px', color:'#64748b' }}>
                <span style={{ color:'#60a5fa', fontWeight:'600' }}>ℹ️ Tip: </span>Reference number is auto-generated. Edit freely or leave as-is.
              </div>
            </>}

            {active === 'org' && <>
              <F label="Organisation Name"><input className="fi" placeholder="e.g. Gigva Kenya Ltd" value={form.orgName} onChange={e => update('orgName', e.target.value)} /></F>
              <F label="Department / Division"><input className="fi" placeholder="e.g. Human Resources" value={form.department} onChange={e => update('department', e.target.value)} /></F>
              <div className="grid2">
                <F label="Street Address"><input className="fi" placeholder="e.g. Westlands" value={form.address} onChange={e => update('address', e.target.value)} /></F>
                <F label="City / Town"><input className="fi" placeholder="Nairobi" value={form.suburb} onChange={e => update('suburb', e.target.value)} /></F>
                <F label="County"><input className="fi" placeholder="Nairobi County" value={form.state} onChange={e => update('state', e.target.value)} /></F>
                <F label="Postcode"><input className="fi" placeholder="00100" value={form.postcode} onChange={e => update('postcode', e.target.value)} /></F>
              </div>
              <F label="Country"><input className="fi" value={form.country} onChange={e => update('country', e.target.value)} /></F>
              <F label="Phone"><input className="fi" placeholder="+254 700 000 000" value={form.phone} onChange={e => update('phone', e.target.value)} /></F>
              <F label="Email"><input className="fi" placeholder="info@gigva.co.ke" value={form.email} onChange={e => update('email', e.target.value)} /></F>
              <F label="Website"><input className="fi" placeholder="www.gigva.co.ke" value={form.website} onChange={e => update('website', e.target.value)} /></F>
              <F label="PIN / Registration No. (optional)"><input className="fi" placeholder="e.g. P051234567M" value={form.abn} onChange={e => update('abn', e.target.value)} /></F>
            </>}

            {active === 'author' && <>
              <F label="Author Full Name"><input className="fi" placeholder="e.g. Aisha Waweru" value={form.authorName} onChange={e => update('authorName', e.target.value)} /></F>
              <F label="Job Title / Position"><input className="fi" placeholder="e.g. Chief Technology Officer" value={form.authorTitle} onChange={e => update('authorTitle', e.target.value)} /></F>
              <F label="Direct Phone"><input className="fi" placeholder="+254 700 000 000" value={form.authorPhone} onChange={e => update('authorPhone', e.target.value)} /></F>
              <F label="Direct Email"><input className="fi" placeholder="cto@gigva.co.ke" value={form.authorEmail} onChange={e => update('authorEmail', e.target.value)} /></F>
            </>}

            {active === 'recipient' && <>
              <F label="Address To">
                <label className={`radio-row ${form.recipientType === 'whom' ? 'sel' : ''}`}>
                  <input type="radio" checked={form.recipientType === 'whom'} onChange={() => update('recipientType', 'whom')} />
                  To Whom It May Concern
                </label>
                <label className={`radio-row ${form.recipientType === 'specific' ? 'sel' : ''}`}>
                  <input type="radio" checked={form.recipientType === 'specific'} onChange={() => update('recipientType', 'specific')} />
                  Addressed to Specific Person
                </label>
              </F>
              {form.recipientType === 'specific' && <>
                <F label="Recipient Name"><input className="fi" value={form.recipientName} onChange={e => update('recipientName', e.target.value)} /></F>
                <F label="Title / Role"><input className="fi" placeholder="e.g. Hiring Manager" value={form.recipientTitle} onChange={e => update('recipientTitle', e.target.value)} /></F>
                <F label="Organisation"><input className="fi" value={form.recipientOrg} onChange={e => update('recipientOrg', e.target.value)} /></F>
                <F label="Address"><input className="fi" value={form.recipientAddress} onChange={e => update('recipientAddress', e.target.value)} /></F>
              </>}
            </>}

            {active === 'employee' && <>
              <F label="Employee Full Name"><input className="fi" placeholder="e.g. John Kamau" value={form.employeeName} onChange={e => update('employeeName', e.target.value)} /></F>
              <F label="Job Title / Position"><input className="fi" placeholder="e.g. Software Engineer" value={form.employeeTitle} onChange={e => update('employeeTitle', e.target.value)} /></F>
              <F label="Department"><input className="fi" placeholder="e.g. Engineering" value={form.employeeDept} onChange={e => update('employeeDept', e.target.value)} /></F>
              <div className="grid2">
                <F label="Start Date"><input className="fi" type="date" value={form.startDate} onChange={e => update('startDate', e.target.value)} /></F>
                <F label="End Date (or leave blank)"><input className="fi" type="date" value={form.endDate} onChange={e => update('endDate', e.target.value)} /></F>
              </div>
              <F label="Employment Type">
                <select className="fi" value={form.employmentType} onChange={e => update('employmentType', e.target.value)}>
                  {['Full-Time','Part-Time','Casual','Contract'].map(v => <option key={v}>{v}</option>)}
                </select>
              </F>
              <F label="Employee / Staff ID"><input className="fi" placeholder="EMP-XXXXX" value={form.employeeId} onChange={e => update('employeeId', e.target.value)} /></F>
            </>}

            {active === 'body' && <>
              <F label="Your Relationship to Employee"><input className="fi" placeholder="e.g. Direct Manager, HR Officer" value={form.relationship} onChange={e => update('relationship', e.target.value)} /></F>
              <F label="Additional Body Paragraph">
                <textarea className="fi" rows={5} placeholder="Add specific achievements, skills, qualities, and examples..." value={form.bodyText} onChange={e => update('bodyText', e.target.value)} />
              </F>
              <F label="Recommendation Strength">
                {['Highly Recommended','Recommended','Recommended with Reservations'].map(r => (
                  <label key={r} className={`radio-row ${form.recommendation === r ? 'sel' : ''}`}>
                    <input type="radio" checked={form.recommendation === r} onChange={() => update('recommendation', r)} />
                    {r}
                  </label>
                ))}
              </F>
              <F label="Closing Statement (optional)">
                <textarea className="fi" rows={2} placeholder="Leave blank to auto-generate from recommendation strength..." value={form.closingText} onChange={e => update('closingText', e.target.value)} />
              </F>
            </>}

            {active === 'footer' && <>
              <F label="Disclaimer Text">
                <textarea className="fi" rows={4} value={form.disclaimer} onChange={e => update('disclaimer', e.target.value)} />
              </F>
              <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'12.5px', color:'#94a3b8' }}>
                <input type="checkbox" checked={form.includeVerification} onChange={e => update('includeVerification', e.target.checked)} />
                Show reference number in footer for verification
              </label>
              <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'12.5px', color:'#94a3b8' }}>
                <input type="checkbox" checked={form.pageNumber} onChange={e => update('pageNumber', e.target.checked)} />
                Include page number
              </label>
            </>}

          </div>
        </div>

        {/* Preview Panel */}
        <div style={{ flex:1, background:'#070e1a', overflowY:'auto', padding:'28px 32px', display:'flex', justifyContent:'center' }}>
          <div style={{ width:'100%', maxWidth:'680px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
              <div style={{ fontSize:'10.5px', color:'#334155', fontWeight:'700', letterSpacing:'0.1em', textTransform:'uppercase' }}>Live Preview — A4 Letter</div>
              <div style={{ fontSize:'10.5px', color:'#475569' }}>{form.letterType}</div>
            </div>

            {/* A4 Sheet */}
            <div ref={previewRef} style={{ background:'white', boxShadow:'0 25px 80px rgba(0,0,0,0.7)', borderRadius:'3px', padding:'52px 60px 44px', minHeight:'1050px', position:'relative', fontFamily:"'EB Garamond', 'Times New Roman', Georgia, serif", fontSize:'11pt', lineHeight:'1.7', color:'#111' }}>

              {/* Watermark */}
              {form.confidentiality !== 'Not Confidential' && (
                <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%) rotate(-35deg)', fontSize:'56px', fontWeight:'900', color: form.confidentiality === 'Strictly Confidential' ? 'rgba(220,38,38,0.06)' : 'rgba(100,116,139,0.055)', whiteSpace:'nowrap', pointerEvents:'none', zIndex:0, fontFamily:'Arial Black, sans-serif', letterSpacing:'0.06em' }}>
                  {form.confidentiality.toUpperCase()}
                </div>
              )}

              <div style={{ position:'relative', zIndex:1 }}>
                {/* Letterhead */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'18px' }}>
                  <div>
                    {form.orgName
                      ? <div style={{ fontFamily:"'Playfair Display', serif", fontSize:'20pt', fontWeight:'700', color:'#0f2d5c', letterSpacing:'-0.01em', lineHeight:1.2, marginBottom:'4px' }}>{form.orgName}</div>
                      : <div style={{ fontSize:'13pt', color:'#ccc', fontStyle:'italic', fontFamily:'sans-serif' }}>[Organisation Name]</div>
                    }
                    {form.department && <div style={{ fontSize:'9pt', color:'#4b5563', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:"'DM Sans', sans-serif" }}>{form.department}</div>}
                    {(form.address || form.suburb) && (
                      <div style={{ fontSize:'9pt', color:'#6b7280', marginTop:'3px', fontFamily:"'DM Sans', sans-serif" }}>
                        {[form.address, form.suburb, form.state, form.postcode, form.country].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign:'right', fontSize:'8.5pt', color:'#6b7280', fontFamily:"'DM Sans', sans-serif", lineHeight:1.8 }}>
                    {form.phone && <div>{form.phone}</div>}
                    {form.email && <div>{form.email}</div>}
                    {form.website && <div>{form.website}</div>}
                    {form.abn && <div style={{ color:'#9ca3af', fontSize:'8pt', marginTop:'2px' }}>PIN: {form.abn}</div>}
                  </div>
                </div>

                {/* Rule */}
                <div style={{ height:'2px', background:'linear-gradient(to right, #0f2d5c 0%, #3b82f6 50%, #bfdbfe 100%)', marginBottom:'20px', borderRadius:'1px' }} />

                {/* Meta Row */}
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'22px', fontSize:'9pt', fontFamily:"'DM Sans', sans-serif", color:'#4b5563' }}>
                  <div>
                    <span style={{ fontWeight:'700', color:'#111' }}>Ref No: </span>{form.refNumber}
                    {form.employeeId && <span style={{ marginLeft:'16px' }}><span style={{ fontWeight:'700', color:'#111' }}>Staff ID: </span>{form.employeeId}</span>}
                    {form.confidentiality !== 'Not Confidential' && (
                      <span style={{ marginLeft:'14px' }}>
                        <span className="badge" style={{ background: form.confidentiality === 'Strictly Confidential' ? 'rgba(220,38,38,0.1)' : 'rgba(100,116,139,0.1)', color: form.confidentiality === 'Strictly Confidential' ? '#dc2626' : '#6b7280', border: `1px solid ${form.confidentiality === 'Strictly Confidential' ? 'rgba(220,38,38,0.25)' : 'rgba(100,116,139,0.25)'}`, fontFamily:"'DM Sans',sans-serif", fontSize:'8px', padding:'1px 7px', borderRadius:'20px', fontWeight:'700' }}>{form.confidentiality}</span>
                      </span>
                    )}
                  </div>
                  <div><span style={{ fontWeight:'700', color:'#111' }}>Date: </span>{formatDate(form.issueDate)}</div>
                </div>

                {/* Recipient Block */}
                <div style={{ marginBottom:'20px', fontSize:'10.5pt' }}>
                  {form.recipientType === 'specific' && form.recipientName ? (
                    <div style={{ lineHeight:1.6 }}>
                      {form.recipientTitle && <div style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'9.5pt', color:'#555' }}>{form.recipientTitle}</div>}
                      <div style={{ fontWeight:'600' }}>{form.recipientName}</div>
                      {form.recipientOrg && <div>{form.recipientOrg}</div>}
                      {form.recipientAddress && <div style={{ color:'#555', fontSize:'9.5pt', fontFamily:"'DM Sans',sans-serif" }}>{form.recipientAddress}</div>}
                    </div>
                  ) : <div />}
                </div>

                {/* Subject */}
                {(form.employeeName || form.employeeTitle) && (
                  <div style={{ marginBottom:'18px', paddingBottom:'10px', borderBottom:'1px solid #e5e7eb' }}>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:'700', fontSize:'10pt', color:'#0f2d5c' }}>
                      RE: {form.letterType}{form.employeeName ? ` — ${form.employeeName}` : ''}
                    </span>
                    {form.employeeTitle && <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:'400', fontSize:'10pt', color:'#555' }}>, {form.employeeTitle}</span>}
                    {form.employeeDept && <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:'400', fontSize:'10pt', color:'#555' }}> ({form.employeeDept})</span>}
                  </div>
                )}

                {/* Body */}
                <div style={{ fontSize:'11pt', lineHeight:'1.75', color:'#1a1a1a' }}>
                  <p style={{ marginBottom:'14px' }}>
                    {form.recipientType === 'specific' && form.recipientName
                      ? `Dear ${form.recipientTitle ? form.recipientTitle + ' ' + form.recipientName.split(' ').slice(-1)[0] : form.recipientName},`
                      : 'To Whom It May Concern,'}
                  </p>
                  <p style={{ marginBottom:'14px', textAlign:'justify' }}>{bodyParagraph1()}</p>
                  <p style={{ marginBottom:'14px', textAlign:'justify' }}>{bodyParagraph2()}</p>
                  <p style={{ marginBottom:'14px', textAlign:'justify' }}>{closingPara()}</p>
                  <p style={{ marginBottom:'36px' }}>Yours sincerely,</p>

                  {/* Sig Block */}
                  <div>
                    <div style={{ width:'160px', height:'40px', borderBottom:'1.5px solid #374151', marginBottom:'6px' }} />
                    <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:'600', fontSize:'12pt' }}>{form.authorName || '[Author Name]'}</div>
                    {form.authorTitle && <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'9.5pt', color:'#4b5563', marginTop:'1px' }}>{form.authorTitle}</div>}
                    {form.orgName && <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'9.5pt', color:'#4b5563' }}>{form.orgName}</div>}
                    {form.authorPhone && <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'9pt', color:'#6b7280', marginTop:'4px' }}>T: {form.authorPhone}</div>}
                    {form.authorEmail && <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'9pt', color:'#6b7280' }}>E: {form.authorEmail}</div>}
                  </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop:'48px', paddingTop:'12px', borderTop:'1px solid #e5e7eb', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                  <div style={{ fontSize:'7.5pt', color:'#9ca3af', maxWidth:'440px', lineHeight:'1.45', fontFamily:"'DM Sans',sans-serif", fontStyle:'italic' }}>{form.disclaimer}</div>
                  <div style={{ textAlign:'right', fontFamily:"'DM Sans',sans-serif", fontSize:'8pt', color:'#9ca3af' }}>
                    {form.includeVerification && <div style={{ marginBottom:'2px' }}>Ref: {form.refNumber}</div>}
                    {form.pageNumber && <div>Page 1 of 1</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Tip below preview */}
            <div style={{ marginTop:'12px', textAlign:'center', fontSize:'11px', color:'#1e3a5f' }}>
              Click <strong style={{ color:'#3b82f6' }}>Print</strong> to print or save as PDF via your browser dialog · <strong style={{ color:'#3b82f6' }}>Download PDF</strong> opens a print-to-PDF window
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function F({ label, children }) {
  return (
    <div>
      <label className="fl">{label}</label>
      {children}
    </div>
  )
}
