'use client'
import CompanyLogo from '@/components/CompanyLogo'
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
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const today = new Date().toISOString().split('T')[0]

const COMPANY_INFO = {
  name: 'Gigva Kenya Ltd',
  poBox: 'P.O. Box 13878-00100',
  location: 'Westlands, Nairobi, Kenya',
  phone: '+254 701 443 444',
  email: 'hello@gigva.co.ke',
  website: 'www.gigva.co.ke',
}

const CTO_INFO = {
  name: 'Aisha Waweru',
  title: 'Chief Technology Officer',
  email: 'cto@gigva.co.ke',
  phone: '+254 701 443 444',
}

const defaultForm = {
  refNumber: generateRefNumber(),
  issueDate: today,
  letterType: 'Employment Reference',
  confidentiality: 'Confidential',
  department: '',
  recipientType: 'whom',
  recipientName: '',
  recipientTitle: '',
  recipientOrg: '',
  recipientAddress: '',
  employeeName: '',
  employeeTitle: '',
  employeeDept: '',
  startDate: '',
  endDate: '',
  employmentType: 'Full-Time',
  employeeId: '',
  relationship: 'direct supervisor',
  bodyText: '',
  recommendation: 'Highly Recommended',
  closingText: '',
  includeVerification: true,
  disclaimer: "This reference letter is confidential and intended solely for the named addressee. The information is based on the author's professional assessment and experience working with the individual.",
  pageNumber: true,
}

const SECTIONS = [
  { id: 'reference', label: 'Reference Details', icon: '🔖' },
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

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('gigva_token') : null
    if (!t) { router.push('/admin/login'); return }
    try {
      const payload = JSON.parse(atob(t.split('.')[1]))
      if (payload.role !== 'cto' && !payload.is_admin) {
        router.push('/admin/dashboard'); return
      }
      setUser(payload)
    } catch { router.push('/admin/login') }
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

  const printStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
    body { margin: 0; padding: 0; font-family: 'Times New Roman', Georgia, serif; font-size: 11pt; color: #111; }
    @media print {
          @page { size: A4 portrait; margin: 12mm 14mm 14mm 14mm; }
          * { visibility: hidden !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          #gigva-letter-print, #gigva-letter-print * { visibility: visible !important; }
          #gigva-letter-print {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 182mm !important;
            min-height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 12mm 14mm 14mm 14mm !important;
            margin: 0 !important;
            background: white !important;
          }
          img { max-width: 100% !important; height: auto !important; }
        }
  `

    const handlePrint = () => {
    window.print()
  }

    const handleDownloadPDF = () => {
    window.print()
  }

  const bodyParagraph1 = () => {
    const name = form.employeeName || '[Employee Name]'
    const title = form.employeeTitle || '[Job Title]'
    const rel = form.relationship || 'direct supervisor'
    const start = form.startDate ? formatDate(form.startDate) : '[Start Date]'
    const end = form.endDate ? formatDate(form.endDate) : 'present'
    const type = form.employmentType
    return `I am writing this letter in my capacity as ${rel} at ${COMPANY_INFO.name}. It is my great pleasure to provide this ${form.letterType.toLowerCase()} for ${name}, who has been employed as a ${type} ${title}${form.employeeDept ? ` within the ${form.employeeDept} department` : ''} from ${start}${form.endDate ? ` to ${end}` : ' to the present date'}.`
  }

  const bodyParagraph2 = () => {
    const name = form.employeeName ? form.employeeName.split(' ')[0] : 'They'
    return form.bodyText || `${name} has consistently demonstrated a high level of professionalism, dedication, and a strong work ethic throughout their time with us. Their contributions have had a measurable positive impact on our team and operations.`
  }

  const closingPara = () => {
    const name = form.employeeName || 'this individual'
    if (form.recommendation === 'Highly Recommended') return form.closingText || `I recommend ${name} without reservation and am fully confident they will be an exceptional asset to any organisation fortunate enough to have them.`
    if (form.recommendation === 'Recommended') return form.closingText || `I am pleased to recommend ${name} and believe they have the capability and determination to succeed in their next role.`
    return form.closingText || `I recommend ${name} with the understanding that they are continuing to grow professionally.`
  }

  if (!authChecked || !user) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0b1120' }}>
      <div style={{ color:'#60a5fa', fontSize:'18px' }}>Loading...</div>
    </div>
  )

  return (
    <div id="ref-letter-page" style={{ fontFamily:"'DM Sans', system-ui, sans-serif", minHeight:'100vh', background:'#0b1120', color:'#e2e8f0', display:'flex', flexDirection:'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .fi { width:100%; background:#111f35; border:1px solid #1e3a5f; color:#e2e8f0; padding:7px 10px; border-radius:6px; font-size:12.5px; font-family:inherit; outline:none; transition:border-color 0.2s; }
        .fi:focus { border-color:#3b82f6; box-shadow:0 0 0 2px rgba(59,130,246,0.15); }
        .fi::placeholder { color:#475569; }
        select.fi option { background:#111f35; }
        textarea.fi { resize:vertical; }
        .fl { display:block; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#64748b; margin-bottom:4px; }
        .sb { width:100%; text-align:left; background:none; border:none; color:#94a3b8; padding:9px 12px; border-radius:7px; cursor:pointer; font-size:12.5px; font-family:inherit; display:flex; align-items:center; gap:9px; transition:all 0.15s; }
        .sb:hover { background:#111f35; color:#e2e8f0; }
        .sb.act { background:linear-gradient(135deg,#1e3a8a,#1d4ed8); color:white; }
        .ab { padding:8px 16px; border-radius:7px; border:none; cursor:pointer; font-size:12.5px; font-weight:600; font-family:inherit; transition:all 0.15s; display:flex; align-items:center; gap:6px; white-space:nowrap; }
        .badge { display:inline-flex; align-items:center; padding:2px 8px; border-radius:20px; font-size:10px; font-weight:700; }
        .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#0b1120; }
        ::-webkit-scrollbar-thumb { background:#1e3a5f; border-radius:4px; }
        .radio-row { display:flex; align-items:center; gap:6px; cursor:pointer; font-size:12.5px; color:#94a3b8; margin-bottom:6px; }
        .radio-row.sel { color:#60a5fa; }
        input[type=radio], input[type=checkbox] { accent-color:#3b82f6; width:14px; height:14px; cursor:pointer; }
        @media print {
          .no-print { display: none !important; }
          body { margin: 0 !important; padding: 0 !important; }
          @page { size: A4 portrait; margin: 10mm 12mm 15mm 12mm; }
          .print-sheet {
            width: 210mm !important;
            min-height: 297mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 15mm 18mm 20mm 18mm !important;
          }
        }
      `}</style>

      {/* Top Bar */}
      <div className="no-print" style={{ background:'#0d1829', borderBottom:'1px solid #1e293b', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:200, flexShrink:0 }}>
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
        <div className="no-print" style={{ width:'190px', background:'#0d1829', borderRight:'1px solid #1e293b', padding:'14px 10px', flexShrink:0, overflowY:'auto' }}>
          <div style={{ fontSize:'9.5px', fontWeight:'700', color:'#334155', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px', paddingLeft:'12px' }}>Sections</div>
          {SECTIONS.map(s => (
            <button key={s.id} className={`sb ${active === s.id ? 'act' : ''}`} onClick={() => setActive(s.id)}>
              <span style={{ fontSize:'14px' }}>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Form Panel */}
        <div className="no-print" style={{ width:'360px', background:'#0f1923', borderRight:'1px solid #1e293b', overflowY:'auto', padding:'20px', flexShrink:0 }}>
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
              <F label="Department / Division"><input className="fi" placeholder="e.g. Engineering" value={form.department} onChange={e => update('department', e.target.value)} /></F>
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
                <F label="End Date (blank = current)"><input className="fi" type="date" value={form.endDate} onChange={e => update('endDate', e.target.value)} /></F>
              </div>
              <F label="Employment Type">
                <select className="fi" value={form.employmentType} onChange={e => update('employmentType', e.target.value)}>
                  {['Full-Time','Part-Time','Casual','Contract'].map(v => <option key={v}>{v}</option>)}
                </select>
              </F>
              <F label="Employee / Staff ID"><input className="fi" placeholder="EMP-XXXXX" value={form.employeeId} onChange={e => update('employeeId', e.target.value)} /></F>
              <F label="Your Relationship to Employee"><input className="fi" placeholder="e.g. Direct Manager, HR Officer" value={form.relationship} onChange={e => update('relationship', e.target.value)} /></F>
            </>}

            {active === 'body' && <>
              <F label="Additional Body Paragraph">
                <textarea className="fi" rows={6} placeholder="Add specific achievements, skills, qualities..." value={form.bodyText} onChange={e => update('bodyText', e.target.value)} />
              </F>
              <F label="Recommendation Strength">
                {['Highly Recommended','Recommended','Recommended with Reservations'].map(r => (
                  <label key={r} className={`radio-row ${form.recommendation === r ? 'sel' : ''}`}>
                    <input type="radio" checked={form.recommendation === r} onChange={() => update('recommendation', r)} />
                    {r}
                  </label>
                ))}
              </F>
              <F label="Custom Closing Statement (optional)">
                <textarea className="fi" rows={2} placeholder="Leave blank to auto-generate..." value={form.closingText} onChange={e => update('closingText', e.target.value)} />
              </F>
            </>}

            {active === 'footer' && <>
              <F label="Disclaimer Text">
                <textarea className="fi" rows={4} value={form.disclaimer} onChange={e => update('disclaimer', e.target.value)} />
              </F>
              <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'12.5px', color:'#94a3b8' }}>
                <input type="checkbox" checked={form.includeVerification} onChange={e => update('includeVerification', e.target.checked)} />
                Show reference number for verification
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
          <div style={{ width:'100%', maxWidth:'794px' }}>
            <div className="no-print" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
              <div style={{ fontSize:'10.5px', color:'#334155', fontWeight:'700', letterSpacing:'0.1em', textTransform:'uppercase' }}>Live Preview — A4 Portrait (210mm × 297mm)</div>
              <div style={{ fontSize:'10.5px', color:'#475569' }}>{form.letterType}</div>
            </div>

            {/* A4 Sheet — 210mm x 297mm at 96dpi = 794px x 1123px */}
            <div ref={previewRef} id="gigva-letter-print" className="print-sheet" style={{
              background:'white',
              boxShadow:'0 25px 80px rgba(0,0,0,0.7)',
              borderRadius:'3px',
              width:'794px',
              minHeight:'1123px',
              padding:'56.7px 67.6px 56.7px 67.6px',
              position:'relative',
              fontFamily:"'EB Garamond', 'Times New Roman', Georgia, serif",
              fontSize:'11pt',
              lineHeight:'1.7',
              color:'#111',
              overflow:'hidden',
            }}>

              {/* Confidential Watermark */}
              {form.confidentiality !== 'Not Confidential' && (
                <div style={{
                  position:'absolute', top:'50%', left:'50%',
                  transform:'translate(-50%,-50%) rotate(-35deg)',
                  fontSize:'60px', fontWeight:'900',
                  color: form.confidentiality === 'Strictly Confidential' ? 'rgba(220,38,38,0.055)' : 'rgba(100,116,139,0.05)',
                  whiteSpace:'nowrap', pointerEvents:'none', zIndex:0,
                  fontFamily:'Arial Black, sans-serif', letterSpacing:'0.06em',
                }}>
                  {form.confidentiality.toUpperCase()}
                </div>
              )}

              <div style={{ position:'relative', zIndex:1, height:'100%', display:'flex', flexDirection:'column', minHeight:'1010px' }}>

                {/* ===== LETTERHEAD ===== */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0', paddingBottom:'12px', borderBottom:'3px solid #1a56db' }}>

                  {/* LEFT: Logo */}
                  <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                    <img
                    src="/assets/gigva-logo.svg"
                    alt="Gigva Kenya"
                    style={{ width: '200px', height: 'auto', display: 'block' }}
                    onError={e => { e.currentTarget.src = '/gigva-logo.png'; }}
                  />
                    {form.department && (
                      <div style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'8pt', color:'#6b7280', letterSpacing:'0.06em', textTransform:'uppercase', marginTop:'4px', paddingLeft:'2px' }}>
                        {form.department}
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Company Info */}
                  <div style={{ textAlign:'right', fontFamily:"'DM Sans', sans-serif", fontSize:'8.5pt', color:'#374151', lineHeight:'1.8' }}>
                    <div style={{ fontWeight:'700', color:'#0f2d5c', fontSize:'10pt', marginBottom:'2px' }}>{COMPANY_INFO.name}</div>
                    <div>{COMPANY_INFO.poBox}</div>
                    <div>{COMPANY_INFO.location}</div>
                    <div>Tel: {COMPANY_INFO.phone}</div>
                    <div>Email: <span style={{ color:'#1a56db' }}>{COMPANY_INFO.email}</span></div>
                    <div>Web: <span style={{ color:'#1a56db' }}>{COMPANY_INFO.website}</span></div>
                  </div>
                </div>

                {/* Blue accent rule below header */}
                <div style={{ height:'1px', background:'rgba(26,86,219,0.2)', marginBottom:'20px' }} />

                {/* Meta Row: Ref + Confidentiality + Date */}
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'20px', fontSize:'9pt', fontFamily:"'DM Sans', sans-serif", color:'#4b5563' }}>
                  <div>
                    <span style={{ fontWeight:'700', color:'#111' }}>Ref No: </span>{form.refNumber}
                    {form.employeeId && <span style={{ marginLeft:'16px' }}><span style={{ fontWeight:'700', color:'#111' }}>Staff ID: </span>{form.employeeId}</span>}
                    {form.confidentiality !== 'Not Confidential' && (
                      <span style={{ marginLeft:'12px', display:'inline-block', background: form.confidentiality === 'Strictly Confidential' ? 'rgba(220,38,38,0.1)' : 'rgba(100,116,139,0.1)', color: form.confidentiality === 'Strictly Confidential' ? '#dc2626' : '#6b7280', border: `1px solid ${form.confidentiality === 'Strictly Confidential' ? 'rgba(220,38,38,0.3)' : 'rgba(100,116,139,0.3)'}`, padding:'1px 8px', borderRadius:'20px', fontSize:'7.5pt', fontWeight:'700' }}>
                        {form.confidentiality}
                      </span>
                    )}
                  </div>
                  <div><span style={{ fontWeight:'700', color:'#111' }}>Date: </span>{formatDate(form.issueDate)}</div>
                </div>

                {/* Recipient Block */}
                {form.recipientType === 'specific' && form.recipientName && (
                  <div style={{ marginBottom:'18px', fontSize:'10.5pt', lineHeight:'1.6' }}>
                    {form.recipientTitle && <div style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'9.5pt', color:'#555' }}>{form.recipientTitle}</div>}
                    <div style={{ fontWeight:'600' }}>{form.recipientName}</div>
                    {form.recipientOrg && <div>{form.recipientOrg}</div>}
                    {form.recipientAddress && <div style={{ color:'#555', fontFamily:"'DM Sans',sans-serif", fontSize:'9.5pt' }}>{form.recipientAddress}</div>}
                  </div>
                )}

                {/* Subject Line */}
                {(form.employeeName || form.employeeTitle) && (
                  <div style={{ marginBottom:'16px', paddingBottom:'10px', borderBottom:'1px solid #e5e7eb' }}>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:'700', fontSize:'10pt', color:'#0f2d5c' }}>
                      RE: {form.letterType}{form.employeeName ? ` — ${form.employeeName}` : ''}
                    </span>
                    {form.employeeTitle && <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:'400', fontSize:'10pt', color:'#555' }}>, {form.employeeTitle}</span>}
                    {form.employeeDept && <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:'400', fontSize:'10pt', color:'#555' }}> ({form.employeeDept})</span>}
                  </div>
                )}

                {/* Letter Body */}
                <div style={{ fontSize:'11pt', lineHeight:'1.8', color:'#1a1a1a', flex:1 }}>
                  <p style={{ marginBottom:'14px' }}>
                    {form.recipientType === 'specific' && form.recipientName
                      ? `Dear ${form.recipientTitle ? form.recipientTitle + ' ' + form.recipientName.split(' ').slice(-1)[0] : form.recipientName},`
                      : 'To Whom It May Concern,'}
                  </p>
                  <p style={{ marginBottom:'14px', textAlign:'justify' }}>{bodyParagraph1()}</p>
                  <p style={{ marginBottom:'14px', textAlign:'justify' }}>{bodyParagraph2()}</p>
                  <p style={{ marginBottom:'14px', textAlign:'justify' }}>{closingPara()}</p>
                  <p style={{ marginBottom:'32px' }}>Yours sincerely,</p>

                  {/* Signature Block + Stamp Row */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>

                    {/* LEFT: Signature */}
                    <div>
                      <div style={{ width:'160px', height:'40px', borderBottom:'1.5px solid #374151', marginBottom:'6px' }} />
                      <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:'700', fontSize:'13pt', color:'#0f2d5c' }}>{CTO_INFO.name}</div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'9.5pt', color:'#1a56db', fontWeight:'600', marginTop:'2px' }}>{CTO_INFO.title}</div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'9pt', color:'#4b5563', marginTop:'1px' }}>{COMPANY_INFO.name}</div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'9pt', color:'#6b7280' }}>
                        <span>E: {CTO_INFO.email}</span>
                      </div>
                    </div>

                    {/* RIGHT: Digital Stamp */}
                    <div style={{ textAlign:'right' }}>
                      <img
                        src="/assets/gigva-stamp.png"
                        alt="Gigva Kenya Official Stamp"
                        style={{ width:'130px', height:'130px', objectFit:'contain', opacity:0.92 }}
                        onError={e => { e.currentTarget.style.display='none'; }}
                      />
                    </div>
                  </div>
                </div>

                {/* ===== FOOTER ===== */}
                <div style={{ marginTop:'32px', paddingTop:'10px', borderTop:'1px solid #e5e7eb', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                  <div style={{ fontSize:'7.5pt', color:'#9ca3af', maxWidth:'460px', lineHeight:'1.5', fontFamily:"'DM Sans',sans-serif", fontStyle:'italic' }}>
                    {form.disclaimer}
                  </div>
                  <div style={{ textAlign:'right', fontFamily:"'DM Sans',sans-serif", fontSize:'8pt', color:'#9ca3af' }}>
                    {form.includeVerification && <div style={{ marginBottom:'2px' }}>Ref: {form.refNumber}</div>}
                    {form.pageNumber && <div>Page 1 of 1</div>}
                  </div>
                </div>

              </div>
            </div>

            {/* Tip */}
            <div className="no-print" style={{ marginTop:'12px', textAlign:'center', fontSize:'11px', color:'#1e3a5f' }}>
              Click <strong style={{ color:'#3b82f6' }}>Print</strong> to print or <strong style={{ color:'#3b82f6' }}>Download PDF</strong> to save as PDF
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
