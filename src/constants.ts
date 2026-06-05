import { Product } from './types';

// 全局资源配置中心
// 您可以在这里直接替换为您的 HTTPS 图片链接

export const ASSETS = {
  // Logo 链接
  LOGO: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET6fRp-ryVMn7Dt3ojrtkI7jVvHFnCaQACrhwAAp0i2Fcv2T8w9oze2zsE.png", 
  
  // 核心产品：金林盆菜
  PENCAI: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAETTcdp4haYnmq2D1_WzTUp2MkiDIXtEQACKigAAogEEFf-_HnElCHQCzsE.png",

  // 首页大背景图
  HERO: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET65Bp-vOPYyf2_xz6cvib6IFXnModXgAC7h4AAp0i2Fc7NRFodGUGgDsE.jpeg",
  
  // 调度后台地图背景
  MAP_BG: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEVBCtqISjGuad8UZnwrljwDx0zbo19LgACnyQAAktMCVXWJqZginQ1uTsE.png",

  // 客服投诉页面的11张盆菜破损照片（您可以在这里直接替换为您上传得到的 https://img.remit.ee/api/file/... 链接）
  COMPLAINT_IMAGES: [
    "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEVA85qISX41Zh2sUprQn0rwqanRuu7fwACRiQAAktMCVWQLs_2O3h-vTsE.png", // 1. 真空包装破裂
    "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEVA7xqISVQNpiAa8sLxuyvww5J1FD1pwACMyQAAktMCVWM4entERY5djsE.png", // 2. 汤汁溢漏与餐具断裂
    "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEVA75qISV1MSQRv1_nkHxMx9RDkk2dEgACOCQAAktMCVVtru-UCzdV-DsE.png", // 3. 外卖打包破损
    "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEVA8VqISWrUul5lF_ibzt_zCgH_MvWKQACPiQAAktMCVUkOlKVim9q1jsE.png", // 4. 器皿口缺角或碎坏
    "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEVA8pqISXXKf8NPiP5pjxg0xgoDyBsWgACQyQAAktMCVUmpdhArivmrjsE.png", // 5. 运输途中翻洒污渍
    "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEVDy5qInpOOsB37Y5FWCRitd1YqPGm1gACjCQAAuKuEFXIDfMr1CjjSzsE.jpeg", // 6. 食物发霉，包装烂掉
    "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEVDzdqInqNNZsIxAIGVkBj402MGrHo2gAClSQAAuKuEFUizt544w_PNTsE.jpeg", // 7. 盆菜变质
    "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEVDzpqInqyCeOVP8uZXflv2ZsC5QyxiAACmiQAAuKuEFUHVGSl6s5IQjsE.jpeg",  // 8. 盆菜受潮，变质，包装坏掉
    "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEVDzxqInrNacau8rvdn_8ktbZTWLFOpQACnCQAAuKuEFWTpXtsBFnHEDsE.jpeg", // 9. 包装被雨水淋坏，真空包装破裂，汤汁溢出来
    "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEVD1lqIntrjZvkAAFWTFDBv0NUIqdgYYAAArkkAALirhBVbaN_Nn25kZ07BA.jpeg", // 10. 盆菜被挤压坏掉
    "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEVD1tqInuO3K_MAY18FGtP_imkZiPKSgACuyQAAuKuEFUkIpAWOrdn0zsE.jpeg"  // 11. 食物变质，真空包装破裂，外包装撕裂汤汁溢出污损
  ],
};

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: '汉堡', price: 12.00, category: '美食外卖', image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET7Blp-vvjlJ1f0aWsQnSJY9jDCJjZyQACtB8AAp0i2FcTGBoBdccPSDsE.jpg', rating: 4.8 },
  { id: '9', name: '椰浆饭', price: 3.00, category: '美食外卖', image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET6_Bp-vkrR8WAyf7dZtJlXHa2L2_4DQACcR8AAp0i2FdXdua1XUrcNzsE.jpg', rating: 5.0 },
  { id: '6', name: '鸡饭', price: 8.00, category: '美食外卖', image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET7CNp-vxUhn9t5keF_dy_Uly1-zTOZQACvh8AAp0i2FeHwgR5LGKK-DsE.jpg', rating: 4.4 },
  { id: '2', name: '肉骨茶', price: 15.50, category: '美食外卖', image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET7CRp-vx27_bLxdEAATsQpJjPFbJFdqgAAr8fAAKdIthX25_jQmGPkqk7BA.jpeg', rating: 4.5 },
  { id: '3', name: '云吞面', price: 9.00, category: '美食外卖', image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET7CVp-vyXjaSbE80R6OreKY26Yw_zGgACwB8AAp0i2Fe258t141zgyDsE.jpeg', rating: 4.9 },
  { id: '4', name: '炒粿条', price: 7.00, category: '美食外卖', image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET7Hxp-wJqD5rCafrSws9_TZCDKMc13QACHyAAAp0i2FfEdbq0M8cv8jsE.jpeg', rating: 4.7 },
  { id: '7', name: '咖喱鸡', price: 12.00, category: '美食外卖', image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET7Dhp-v0sdGwhkZFlUpAxiu5uNYMUKgAC1B8AAp0i2Fdu54UdhmHvuzsE.jpg', rating: 4.9 },
  { id: '5', name: '披萨', price: 25.00, category: '美食外卖', image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET7Dtp-v1rUYgOGxth7LocUF60UWB5EQAC1x8AAp0i2FdPdF9oq8d2rTsE.jpg', rating: 4.6 },
  { id: '8', name: '沙爹', price: 5.00, category: '美食外卖', image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET7EBp-v2Wn4oJZMcaMnvMeSTE17T2JgAC3B8AAp0i2Fd7iGWZoy-8ZTsE.jpg', rating: 4.3 },
];
