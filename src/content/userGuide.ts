// Long-form user manual, shown on the login page (quick start), the
// /guide page (everything) and while the backend is waking up. Lives here
// rather than in locales/*/labels.ts because it's prose, not UI labels -
// but the labels files' rule still applies: add to both languages.
//
// What's visible to a signed-in user depends on their role, so the
// "areas" list says so rather than promising everything to everyone.

export interface GuideStep {
  title: string;
  body: string;
}

export interface GuideArea {
  name: string;
  body: string;
}

export interface GuideContent {
  pageTitle: string;
  pageSubtitle: string;
  waitingNote: string;
  quickStartTitle: string;
  quickStart: GuideStep[];
  tryItTitle: string;
  tryIt: GuideStep[];
  areasTitle: string;
  areasIntro: string;
  areas: GuideArea[];
  mobileTitle: string;
  mobileIntro: string;
  mobile: GuideArea[];
  tipsTitle: string;
  tips: string[];
  readFullGuide: string;
  backToSignIn: string;
  signInNow: string;
  serverWaking: string;
  serverReady: string;
}

const en: GuideContent = {
  pageTitle: "User guide",
  pageSubtitle: "A short tour of the Admin Portal - what it is, how to get in, and what to try first.",
  waitingNote:
    "This demo runs on a free host that sleeps when idle. If the server is starting up it can take up to a minute - you can read this guide while you wait, and sign in as soon as it's ready.",
  quickStartTitle: "Quick start",
  quickStart: [
    {
      title: "Create an account",
      body: "Choose Register on the sign-in page. Use an email address you can open - you'll need it for the next step.",
    },
    {
      title: "Verify your email",
      body: "Open the link we email you. Sign-in stays blocked until your email is verified.",
    },
    {
      title: "Sign in",
      body: "Use your username and password. If you turned on two-factor sign-in, you'll be asked for the code from your authenticator.",
    },
    {
      title: "Pick something from the menu",
      body: "The left-hand menu shows what your role can use. Start with Dashboard, then try the walkthrough below.",
    },
  ],
  tryItTitle: "Try it in five minutes",
  tryIt: [
    {
      title: "Add a property",
      body: "Properties > Add Property. Give it a name, address and type, then open it and add a unit or two (bedrooms, rent).",
    },
    {
      title: "Log a maintenance ticket",
      body: "On the property page, add a ticket against a unit and assign it to a user. The assignee sees it in the mobile app.",
    },
    {
      title: "Publish it to the homestay showcase",
      body: "Edit the property, tick the publish option, add a description and a photo. Then use View public listing - anyone can see that page without signing in.",
    },
    {
      title: "Run a stock check",
      body: "Inventory holds products. In Stock Checks, create a task, pick a worker and the products to count. The worker counts on the mobile app by scanning barcodes, submits, and you review and sign off.",
    },
    {
      title: "Watch it happen live",
      body: "Who's Online shows everyone connected right now, on the web and on mobile, and what they're looking at.",
    },
  ],
  areasTitle: "What's in the portal",
  areasIntro:
    "You only see the areas your role allows. If something below is missing from your menu, your account doesn't have that permission - ask an administrator.",
  areas: [
    { name: "Dashboard", body: "Headline numbers for the areas you can access, each linking through to its page." },
    { name: "Properties", body: "Properties and their units, maintenance tickets, and the homestay showcase settings (publish, description, photos)." },
    { name: "Stock Checks and Inventory", body: "Products and stock levels, plus counting tasks assigned to workers. Submissions from outside the configured work-site radius are flagged, not blocked." },
    { name: "Complaints", body: "Anyone can raise a complaint. Users with the right permission also get an inbox to review and resolve them." },
    { name: "Who's Online", body: "Live list of connected users across web and mobile." },
    { name: "APK Versions", body: "Android app releases. Scan the QR code to install the app on a phone." },
    { name: "Freelancers", body: "A public freelancer directory." },
    { name: "User Management", body: "Users and roles, for administrators." },
    { name: "System settings", body: "IP Whitelist, Telegram Alerts and Modules (turn parts of the portal on or off). Super administrators only." },
  ],
  mobileTitle: "The Android app",
  mobileIntro:
    "Install it from APK Versions in the portal (scan the QR code, then allow installs from the app when asked). Sign in with the same account - you stay signed in for about 30 days.",
  mobile: [
    { name: "Home", body: "Scan a barcode, check for app updates, and open Maintenance and Homestays." },
    { name: "Tasks", body: "Your assigned stock checks. Open one, scan items to count them (the scanner reopens after each scan), add optional photos, then submit." },
    { name: "Maintenance", body: "Tickets assigned to you. Add an optional photo and a note, then mark resolved." },
    { name: "Online", body: "Who else is connected right now." },
    { name: "Authenticator", body: "Use this phone as the authenticator for two-factor sign-in." },
  ],
  tipsTitle: "Good to know",
  tips: [
    "The first page load after a quiet period can take up to a minute while the free host wakes up. This is normal and only happens at the start.",
    "Use the EN / 中文 switch in the portal header to change language.",
    "Photos are optional everywhere. The homestay showcase is the only place they're shown publicly.",
    "Parts of the portal can be switched off by an administrator, so a menu item may disappear - that's by design.",
  ],
  readFullGuide: "Read the full user guide",
  backToSignIn: "Back to sign in",
  signInNow: "Sign in",
  serverWaking: "Server is starting up - you can keep reading.",
  serverReady: "Server is ready.",
};

const zh: GuideContent = {
  pageTitle: "使用指南",
  pageSubtitle: "快速了解管理门户:它是什么、如何登录,以及先体验哪些功能。",
  waitingNote:
    "本演示运行在免费主机上,闲置时会休眠。若服务器正在启动,最多需要一分钟——您可以先阅读本指南,准备好后即可登录。",
  quickStartTitle: "快速开始",
  quickStart: [
    {
      title: "注册账号",
      body: "在登录页选择“注册”。请使用您能收到邮件的邮箱,下一步需要用到。",
    },
    {
      title: "验证邮箱",
      body: "打开我们发送给您的邮件链接。邮箱验证完成前无法登录。",
    },
    {
      title: "登录",
      body: "输入用户名和密码。如果您开启了两步验证,还需要输入验证器中的验证码。",
    },
    {
      title: "从菜单开始",
      body: "左侧菜单只显示您的角色可以使用的功能。先看看“仪表盘”,再试试下面的体验流程。",
    },
  ],
  tryItTitle: "五分钟体验",
  tryIt: [
    {
      title: "添加房产",
      body: "房产 > 添加房产。填写名称、地址和类型,然后进入详情,添加一两个房间(卧室数、租金)。",
    },
    {
      title: "记录维修工单",
      body: "在房产页面为某个房间添加工单并指派给某位用户。被指派人会在手机应用中看到它。",
    },
    {
      title: "发布到民宿展示页",
      body: "编辑房产,勾选发布选项,填写描述并上传照片。然后点击“查看公开页面”——无需登录任何人都能访问。",
    },
    {
      title: "进行一次盘点",
      body: "“库存”管理产品。在“盘点任务”中创建任务,选择员工和要盘点的产品。员工在手机上扫码盘点并提交,您审核后确认。",
    },
    {
      title: "实时查看",
      body: "“在线状态”显示当前所有在线的人(网页和手机),以及他们正在查看的页面。",
    },
  ],
  areasTitle: "门户包含什么",
  areasIntro: "您只能看到角色所允许的功能。如果下面的某项在菜单中不存在,说明您的账号没有对应权限——请联系管理员。",
  areas: [
    { name: "仪表盘", body: "显示您有权访问的各功能的关键数字,点击可进入对应页面。" },
    { name: "房产", body: "房产及其房间、维修工单,以及民宿展示设置(发布、描述、照片)。" },
    { name: "盘点与库存", body: "产品与库存数量,以及指派给员工的盘点任务。在设定工作地点范围之外提交的盘点会被标记,但不会被阻止。" },
    { name: "投诉", body: "任何人都可以提交投诉。拥有相应权限的用户还有收件箱用于审核和处理。" },
    { name: "在线状态", body: "网页和手机上当前在线用户的实时列表。" },
    { name: "APK 版本", body: "安卓应用发布。扫描二维码即可在手机上安装应用。" },
    { name: "自由职业者", body: "公开的自由职业者目录。" },
    { name: "用户管理", body: "面向管理员的用户与角色管理。" },
    { name: "系统设置", body: "IP 白名单、Telegram 提醒和功能模块(开启或关闭门户的某些部分),仅限超级管理员。" },
  ],
  mobileTitle: "安卓应用",
  mobileIntro:
    "在门户的“APK 版本”中安装(扫描二维码,提示时允许该应用安装更新)。使用同一账号登录,约 30 天内保持登录状态。",
  mobile: [
    { name: "首页", body: "扫描条码、检查应用更新,并进入“维修”和“民宿”。" },
    { name: "任务", body: "指派给您的盘点任务。打开后扫描商品计数(每次扫描后扫描器会自动重新打开),可选择添加照片,然后提交。" },
    { name: "维修", body: "指派给您的工单。可添加照片和备注,然后标记为已解决。" },
    { name: "在线", body: "查看当前还有谁在线。" },
    { name: "验证器", body: "将这部手机用作两步验证的验证器。" },
  ],
  tipsTitle: "温馨提示",
  tips: [
    "闲置一段时间后第一次打开页面,免费主机唤醒可能需要最多一分钟。这是正常现象,只在开始时出现。",
    "使用门户顶部的 EN / 中文 切换语言。",
    "所有照片均为可选。只有“民宿展示”会公开显示照片。",
    "管理员可以关闭门户的部分功能,因此菜单项可能消失——这是设计如此。",
  ],
  readFullGuide: "阅读完整使用指南",
  backToSignIn: "返回登录",
  signInNow: "登录",
  serverWaking: "服务器正在启动——您可以继续阅读。",
  serverReady: "服务器已就绪。",
};

export function getGuideContent(language: string | undefined): GuideContent {
  return language?.startsWith("zh") ? zh : en;
}
