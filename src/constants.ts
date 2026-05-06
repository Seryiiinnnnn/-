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
  MAP_BG: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAETTcVp4hZjhzFmCyVlmIHI_aLJ-mEG8AACKCgAAogEEFdu8zonPk-FpTsE.png",
};

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: '汉堡', price: 12.00, category: '美食外卖', image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET7Blp-vvjlJ1f0aWsQnSJY9jDCJjZyQACtB8AAp0i2FcTGBoBdccPSDsE.jpg', rating: 4.8 },
  { id: '9', name: '椰浆饭', price: 3.00, category: '美食外卖', image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET6_Bp-vkrR8WAyf7dZtJlXHa2L2_4DQACcR8AAp0i2FdXdua1XUrcNzsE.jpg', rating: 5.0 },
  { id: '6', name: '鸡饭', price: 8.00, category: '美食外卖', image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET7CNp-vxUhn9t5keF_dy_Uly1-zTOZQACvh8AAp0i2FeHwgR5LGKK-DsE.jpg', rating: 4.4 },
  { id: '2', name: '肉骨茶', price: 15.50, category: '美食外卖', image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET7CRp-vx27_bLxdEAATsQpJjPFbJFdqgAAr8fAAKdIthX25_jQmGPkqk7BA.jpeg', rating: 4.5 },
  { id: '3', name: '云吞面', price: 9.00, category: '美食外卖', image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET7CVp-vyXjaSbE80R6OreKY26Yw_zGgACwB8AAp0i2Fe258t141zgyDsE.jpeg', rating: 4.9 },
  { id: '4', name: '炒粿条', price: 10.00, category: '美食外卖', image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET7DRp-vzxpcdmo6qtQ5ynDwl6Tfp3lAAC0B8AAp0i2FdQ3vnMIBPt7TsE.jpeg', rating: 4.7 },
  { id: '7', name: '咖喱鸡', price: 12.00, category: '美食外卖', image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET7Dhp-v0sdGwhkZFlUpAxiu5uNYMUKgAC1B8AAp0i2Fdu54UdhmHvuzsE.jpg', rating: 4.9 },
  { id: '5', name: '披萨', price: 25.00, category: '美食外卖', image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET7Dtp-v1rUYgOGxth7LocUF60UWB5EQAC1x8AAp0i2FdPdF9oq8d2rTsE.jpg', rating: 4.6 },
  { id: '8', name: '沙爹', price: 5.00, category: '美食外卖', image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAET7EBp-v2Wn4oJZMcaMnvMeSTE17T2JgAC3B8AAp0i2Fd7iGWZoy-8ZTsE.jpg', rating: 4.3 },
];
