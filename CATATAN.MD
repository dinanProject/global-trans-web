GLOBAL TRANS — PERFORMANCE OPTIMIZATION + APPROVAL REVIEW MIGRATION

SOURCE OF TRUTH TERBARU

- src-web-02-56-wib.zip
- src-api-02-56-wib.zip
- file/source terbaru yang dikirim selalu jadi source of truth
- jangan mengandalkan versi dari chat lama

BRANCH

- Web: development / production
- API: development / production
- tidak ada branch main
- workflow: patch → test lokal → development → validasi → production

RULES KERJA

- patch kecil dan terarah
- jangan overwrite full file kecuali user memang minta full HTML/CSS
- jangan refactor besar sekaligus tanpa diminta
- jangan rename function existing tanpa diminta
- jangan mengarang function, route, permission, table, field, constant, selector, atau struktur file
- baca source terbaru sebelum memberi patch
- selalu sebut:
    - nama file
    - lokasi penempatan
    - bagian ditambah
    - bagian diubah
    - bagian dihapus
- gunakan UtilityService.confirm() / UtilityService.alert()
- jangan gunakan window.confirm() / window.alert()
- optimasi struktur load sebelum caching
- initial page hanya fetch data yang perlu untuk render awal
- master Add/Edit lazy-load
- boleh in-memory reuse
- jangan pakai localStorage/sessionStorage untuk performance sebelum terbukti perlu
- cek redundant HTTP
- cek N+1/query per-row
- cek payload list terlalu gemuk
- kerjakan per module/menu sampai tuntas
- kalau satu tahap sengaja dipending, wajib kembali dicek sebelum module ditandai DONE
- Menu + Permission Management di-exclude dari performance audit
- jangan pakai GitHub connector ChatGPT; git manual via terminal saja

STATUS PERFORMANCE MODULE

1. Dashboard

- DONE
- chart disabled
- no dashboard HTTP initial load

2. Organization → Companies

- DONE
- initial /company + company_type lookup memang perlu
- backend no N+1

3. Organization → Divisions

- DONE
- setelah CRUD hanya reload /division, tidak reload /company
- Edit tanpa perubahan → 0 PUT

4. Equipment → Categories

- DONE
- initial 1 request
- backend no N+1
- Edit tanpa perubahan → 0 PUT

5. Equipment → Units

- DONE
- capacity lookup lazy-load saat Add/Edit
- in-memory reuse
- initial hanya /equipment-unit + /equipment-category
- Edit tanpa perubahan → 0 PUT
- backend no N+1
- tidak ada detail popup

6. Equipment Request → Assignments

- PERFORMANCE PATCH COMPLETE
- initial load dipangkas
- category master tidak perlu
- unit master lazy-load
- Completed tidak tampil default worklist, tapi tetap bisa filter
- bulk Assign All endpoint sudah dibuat
- bulk Start All endpoint sudah dibuat
- synchronize assignment status N+1 sudah diperbaiki
- workspace endpoint slim: 2 HTTP detail → 1 HTTP
- typo fix wajib:
  findAssignmentsByRequestId(...) → findAssignments(...)
  pada bulk assign dan start-all
- masih perlu regression:
    - Assign All
    - Start All
    - individual action
    - status transition

7. Equipment Request → Requests

- DONE
- lazy master Add/Edit
- bulk available actions
- list hanya 1 equipment preview + detailCount
- detail endpoint tetap full
- load sekarang jauh lebih cepat

8. Equipment Request → Approvals

- PERFORMANCE PATCH COMPLETE
- list:
    - bulk available actions
    - 1 equipment preview + detailCount
- Review availability:
    - N×3 query → bulk 4 query
- final Approve availability validation:
    - N+1 → bulk validation
- Review endpoint slim tersedia
- legacy Detail button di Approval list sudah disepakati dihapus
- Approval list sekarang hanya Review action
- Approval list kolom dipecah:
  Request | Company | Equipment | Period | Status | Actions
- review page baru menggantikan modal review

9. Equipment Request → Monitoring

- PATCH COMPLETE
- 2 endpoint summary+assignments → 1 /overview
- default ACTIVE:
  ASSIGNED + IN_OPERATION + COMPLETED hari ini
- Completed lama tidak ikut initial load
- OnDestroy + takeUntil sudah ditambah
- status filter binding dibenahi
- icon category:
  backend kirim category.icon
  frontend resolver pakai icon master + fallback equipment.svg
- detail frontend route monitoring/:uuid belum ada
- dead navigation detail disarankan dibuang
- pagination historical = future scalability, bukan blocker

10. Administration → Email

- PATCH COMPLETE / TEST PENDING
- initial server-side pagination sudah sehat
- no N+1
- retry email update row lokal, jangan reload list penuh

11. Administration → User Management

- PATCH COMPLETE / TEST PENDING
- initial hanya GET /user
- /user/options lazy-load Add/Edit
- in-memory reuse
- Edit tanpa perubahan → 0 PUT
- backend list no N+1

12. Administration → Role Management

- PATCH COMPLETE / TEST PENDING
- /role/options lazy-load Add/Edit
- Edit tanpa perubahan → 0 PUT
- permission dialog tetap lazy
- permission pristine → 0 PUT
- createRoleDetailQuery dioptimasi:
  permissionCount dan userCount lewat pre-aggregated subquery
  jangan join langsung rolePermissions × userRoles
- hapus console.log lama

SKIP PERFORMANCE

- Administration → Menu
- Administration → Permission Management

SIDEBAR / MENU

- exact active route tetap dipakai untuk leaf menu
- parent menu harus auto-expanded saat current route ada di child
- hard refresh harus tetap membuka parent
- nested Approval Review:
  /equipment-request/approvals/:uuid/review
  harus tetap:
    - Equipment Request expanded
    - Approvals highlight biru
- hasActiveChild boleh exact-or-prefix untuk nested Approvals
- jangan pakai global startsWith pada semua leaf jika menyebabkan parent/child sama-sama biru
- Unauthorized / Not Found jangan disentuh

APPROVAL REVIEW PAGE BARU

Route:

- /equipment-request/approvals/:uuid/review
- PermissionGuard
- permission: EQUIPMENT_APPROVAL.VIEW
- dibuka new tab dari Approval list

Component:

- approvals/approval-review/approval-review.component.ts/html/scss

Tujuan:

- dipakai ulang Client Review + GTSI Review
- jangan bikin page terpisah
- availableActions menentukan action/stage

UI:

- full page, bukan modal
- enterprise style
- warna soft, jangan terlalu hitam
- equipment tampil seperti operational review table
- availability jadi fokus
- schedule dan notes di lower section
- action bar sticky
- mobile responsive
- format semua tanggal display:
  dd/MM/yyyy HH:mm
- Current Period / Availability / Requested Period harus konsisten format

Schedule:

- satu Reservation Schedule berlaku untuk seluruh equipment unit
- jangan per-unit schedule karena data model sekarang request-level startDate/endDate
- label jelas bahwa schedule berlaku ke semua unit

Approve behavior:

- user boleh edit Start/End
- tidak recheck tiap perubahan
- recheck availability saat klik Approve saja
- flow:
  klik Approve
  → GET /approval/:uuid/review?startDate=...&endDate=...
  → update availability cards
  → kalau conflict: stay di page, tampil error, tidak execute action
  → kalau semua available: execute approval action
  → backend final validation tetap jalan lagi dalam transaction
- Reject tidak perlu recheck availability
- error message jangan tampil double
- initial load error dan action/recheck error harus dipisah konteksnya

Approval Review success flow:

- Review dibuka new tab
- setelah Approve/Reject sukses:
    - alert success via UtilityService.alert()
    - refresh opener Approvals tab jika ada
    - close review tab
    - fallback navigate ke /equipment-request/approvals jika tidak ada opener
- jangan window.alert / window.confirm

Approval Review legacy cleanup:

- JANGAN dihapus dulu sebelum full regression selesai
- setelah Client + GTSI page baru 100% aman, baru cleanup:
    - ReviewDialogComponent lama
    - review-dialog html/scss/ts
    - openReviewDialog()
    - submitReview()
    - import/type khusus dialog yang tidak punya caller
    - MatDialog import di ApprovalsComponent jika sudah tidak dipakai
- tujuan cleanup:
  menghindari dead code / duplicate review logic / developer salah edit file lama

APPROVAL LIST UI

- Detail button di Approval list disepakati dihapus
- alasan:
  Review page baru sudah lebih lengkap
  actionable approval list cukup punya Review
  setelah approve/reject item keluar dari list
- jangan hapus full detail endpoint/component jika masih dipakai menu lain

Approval table target:

- Request 22%
- Company 16%
- Equipment 20%
- Period 17%
- Status 13%
- Actions 12%
- hapus old companyEquipment styles
- hapus duplicate mat-column-actions width
- action column tidak perlu 300px karena cuma tombol Review
- equipment preview 1 item + +N lainnya

PENDING FINAL REGRESSION

Assignments:

- Assign All
- Start All
- individual action
- status transition
- verify findAssignments fix

Approvals:

- Client Review
- GTSI Review
- edit schedule → conflict
- edit schedule → available
- Approve
- Reject
- opener refresh + close tab
- mobile
- nested menu highlight
- +N equipment
- final availability validation
- permission/action consistency

Monitoring:

- overview
- active/today default
- icon rendering
- filter/search/status
- lifecycle leave/re-enter page

Administration:

- Email retry local update
- User lazy options
- User no-change save
- Role lazy options
- Role no-change save
- Role permission pristine
- permissionCount/userCount same after aggregate query

GLOBAL REGRESSION

- console error
- network redundant call
- Unauthorized
- Not Found
- permission visibility
- Add/Edit no-change
- approval workflow
- assignment workflow
- mobile major pages

FINAL AFTER REGRESSION

1. cleanup legacy Approval Review modal
2. git status / diff
3. push development
4. validate development
5. baru production
