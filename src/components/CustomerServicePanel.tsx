import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Send, Image as ImageIcon, Sliders, AlertTriangle, 
  User, Clock, CheckCircle, Plus, Trash2, DollarSign, Truck, 
  Sparkles, X, Maximize2, RefreshCw, Volume2, Lock, Bell, BellOff 
} from 'lucide-react';
import { ComplaintChat, ChatMessage } from '../types';
import { cn } from '../lib/utils';
import { ASSETS } from '../constants';

// Use complaint images from assets in constants.ts or fallback to default high quality samples
const BROKEN_PENCAI_IMAGES = ASSETS.COMPLAINT_IMAGES || [
  "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=600", // Cracked brown ceramic clay pot
  "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600", // Cracked bowl and leaking food
  "https://images.unsplash.com/photo-1584263343329-a4413f64d0d0?auto=format&fit=crop&q=80&w=600", // Messed up delivery bag
  "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=600", // Damaged exterior wrap
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600"  // Leaking food package 2
];

const CHINESE_FIRST_NAMES = ["张", "白", "李", "王", "刘", "赵", "陈", "杨", "黄", "周", "吴", "徐", "孙", "许"];
const CHINESE_LAST_NAMES = ["伟", "芳", "娜", "秀英", "敏", "静", "丽", "强", "磊", "超", "俊", "洋", "帅", "勇", "美玲", "建国", "杰", "丹", "涛", "萍"];

// Gender-specific high quality customer avatars
const MALE_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop", // laughing man with glasses
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop", // businessman
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop", // stylish master
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop", // bearded guy
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=100&auto=format&fit=crop", // casual young man
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=100&auto=format&fit=crop", // professional man
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=100&auto=format&fit=crop", // smile male
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop"  // tech male
];

const FEMALE_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop", // smiling woman
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop", // young female
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop", // woman with glasses
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=100&auto=format&fit=crop", // fashion girl
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop", // woman
  "https://images.unsplash.com/photo-1481214110143-bc634a1fc67c?q=80&w=100&auto=format&fit=crop", // outdoor female
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=100&auto=format&fit=crop", // curly hair female
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=100&auto=format&fit=crop"  // senior or mature woman
];

// Aligns avatar gender precisely to names containing (先生) vs (女士) or (小姐),
// and chooses deterministically so each different name gets a unique, non-overlapping avatar.
function getCustomerAvatar(name: string): string {
  const isFemale = name.includes('女士') || name.includes('小姐') || name.includes('太太') || name.includes('女') || name.includes('芳') || name.includes('娜') || name.includes('秀英') || name.includes('静') || name.includes('丽') || name.includes('美') || name.includes('萍') || name.includes('丹');
  
  // Deterministic hashing so different names get completely different avatars
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const list = isFemale ? FEMALE_AVATARS : MALE_AVATARS;
  const index = Math.abs(hash) % list.length;
  return list[index];
}

const DEFAULT_COMPLAINT_TEMPLATES = [
  "刚收到的金林盆菜，打开竟然全碎了！里面的汤汁全都漏在外面，粘糊糊的根本没法吃，这可是我今晚聚餐的主菜啊！",
  "太失望了！送来的盆菜不知道被谁摔过，外包装严重变形，陶碗也已经破裂损坏了。看看照片，这怎么入口？",
  "我花了快四百马币预定的精品盆菜，送到家汤都要漏干了。砂锅破了一道明显的裂缝，里面最好的鲍鱼海参都掉在包装袋里了！",
  "配送速度是挺快，但是盆菜在路途里被震得一塌糊涂，食物都散落破损，碗口也有明显的豁口。要求立即重新配送！",
  "老板，你们家盆菜的碗抗震能力太差了吧，收到全烂了。今晚招待长辈直接尴尬死。要么赶紧重发一碗，要么全额退款！",
  "太恶心了！刚收到的金林盆菜，最上面的食材居然全发霉长出白毛了，外包装的盒子也是又湿又烂。这根本是发霉变质的库存，要求立即退款赔偿！",
  "大过节的，送来的盆菜居然是臭的！盖子一掀开就有股强烈的变质酸臭味，里面的鲍鱼和猪手质地全软烂发粘了，完全就是坏掉的！",
  "整箱盆菜受潮得一塌糊涂，外包装箱一撕就碎。更可怕的是里面的元老级海参都有股馊味，汤汁浑浊漏气，彻底变质了，根本不敢吃！",
  "送货的时候刚好下暴雨，骑手也没盖好。外面的大箱全被雨水淋垮软掉了，里面真空密闭袋还破了，汤汁混合着雨水流得到处都是，全脏了！",
  "我的老天，送来的这盆菜是被重物砸过吗？包装箱彻底被压瘪了，里面的不锈钢盘都被挤压得拧破变形，食材全烂成稀泥从封口灌出来，气死我了！",
  "老板！包装大撕裂！里面的真空包装带全是破洞，汤汁洒满整个袋子，发散出一股肉类变质的腥臭味。这严重危害食品安全卫生，建议你们好好整顿！"
];

const DEFAULT_QUICK_REPLIES = [
  "非常抱歉耽误您的聚餐，我们现在立即安排专车为您加急免费重新配送一份精美的金林盆菜并附赠大额优惠券，请您稍候！",
  "尊敬的用户您好，非常抱歉给您的用餐体验带来影响。我们已经核实包裹损毁情况，并将在此刻为您安排全额退款，预计在1到3个工作日到达您的支付账户。",
  "抱歉给您带来烦恼了。我们正在协调备货，并已安排专门的售后服务电话与您沟通赔偿和配送细节，请保持您的电话畅通！",
  "对不起！可能是由于今天下雨路滑影响了骑手的包裹承重，我们将对包装采取加厚泡沫升级，避免损坏。感谢您的热心反馈，我们会加强包装改进！"
];

interface CustomerServicePanelProps {
  isDarkMode: boolean;
  currentTime: number;
  sidebarOpen?: boolean;
}

export default function CustomerServicePanel({ isDarkMode, currentTime, sidebarOpen = true }: CustomerServicePanelProps) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [showSimEngine, setShowSimEngine] = useState(false);
  
  // Simulation configurations
  const [isSimEnabled, setIsSimEnabled] = useState(() => {
    const saved = localStorage.getItem('cs_simulation_enabled');
    return saved !== 'false'; // default is true
  });
  const [simInterval, setSimInterval] = useState(() => {
    const saved = localStorage.getItem('cs_simulation_interval');
    return saved ? parseInt(saved) : 20; // default 20 seconds
  });
  
  // Custom templates state
  const [templates, setTemplates] = useState<string[]>(() => {
    const saved = localStorage.getItem('cs_complaint_templates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 5) {
          return parsed;
        }
      } catch (e) {
        // Fallback below
      }
    }
    return DEFAULT_COMPLAINT_TEMPLATES;
  });
  const [newTemplateText, setNewTemplateText] = useState('');
  
  // Continuous Popups Configurations (Speed and Quantity constraints requested by user)
  const [toastStreamEnabled, setToastStreamEnabled] = useState(() => {
    const saved = localStorage.getItem('cs_stream_enabled');
    return saved !== 'false'; // default is true
  });
  const [toastStreamSpeed, setToastStreamSpeed] = useState(() => {
    const saved = localStorage.getItem('cs_stream_speed');
    return saved ? parseFloat(saved) : 3; // default is 3 seconds between popups
  });
  const [toastStreamLimit, setToastStreamLimit] = useState(() => {
    const saved = localStorage.getItem('cs_stream_limit');
    return saved ? parseInt(saved) : 4; // default max 4 popups on screen simultaneously
  });
  const [streamToasts, setStreamToasts] = useState<Array<{
    id: string;
    name: string;
    phone: string;
    text: string;
    image: string;
    timestamp: number;
  }>>([]);

  // Ref tracking the cycle of images for sequential rotating popups and complains
  const imageCycleRef = useRef<number>(0);
  
  // Complaint message chats list
  const [chats, setChats] = useState<ComplaintChat[]>(() => {
    const saved = localStorage.getItem('cs_complaint_chats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ComplaintChat[];
        // Dynamically ensure avatar is deterministic and gender-correct for all parsed local storage chats too
        return parsed.map(c => ({
          ...c,
          customerAvatar: getCustomerAvatar(c.customerName)
        }));
      } catch (e) {
        console.warn('Failed to parse saved chats', e);
      }
    }
    
    // Initial seeded complaints
    const initialChats: ComplaintChat[] = [
      {
        id: 'c-1',
        customerName: '李小姐 (王后花园)',
        customerPhone: '012-345 6789',
        customerAvatar: getCustomerAvatar('李小姐 (王后花园)'),
        status: 'pending',
        lastUpdated: Date.now() - 3600000,
        hasUnread: true,
        messages: [
          {
            id: 'm-1',
            sender: 'customer',
            text: '刚收到的金林盆菜，打开竟然全碎了！里面的汤汁全都漏在外面，粘糊糊的根本没法吃，这可是我今晚聚餐的主菜啊！',
            timestamp: Date.now() - 3600000,
            image: BROKEN_PENCAI_IMAGES[0]
          }
        ]
      },
      {
        id: 'c-2',
        customerName: '张伟先生 (吉隆坡中心)',
        customerPhone: '019-876 5432',
        customerAvatar: getCustomerAvatar('张伟先生 (吉隆坡中心)'),
        status: 'resolved',
        lastUpdated: Date.now() - 7200000,
        hasUnread: false,
        messages: [
          {
            id: 'm-2',
            sender: 'customer',
            text: '太失望了！送来的盆菜不知道被谁摔过，外包装严重变形，陶碗也已经破裂损坏了。看看照片，这怎么入口？',
            timestamp: Date.now() - 7200000,
            image: BROKEN_PENCAI_IMAGES[1]
          },
          {
            id: 'm-3',
            sender: 'employee',
            text: '非常抱歉耽误您的聚餐，我们将立即为您免费重送一份，并退款100马币作为补偿！',
            timestamp: Date.now() - 7000000
          }
        ]
      }
    ];
    return initialChats;
  });

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Automatically migrate saved local storage chats containing Unsplash images to user's uploaded images
  useEffect(() => {
    let replaced = false;
    const updatedChats = chats.map(chat => {
      let chatUpdated = false;
      const updatedMessages = chat.messages.map(msg => {
        if (msg.image && msg.image.includes('images.unsplash.com')) {
          let newImg = msg.image;
          if (msg.image.includes('1618220179428')) newImg = BROKEN_PENCAI_IMAGES[0];
          else if (msg.image.includes('1596461404969')) newImg = BROKEN_PENCAI_IMAGES[1];
          else if (msg.image.includes('1584263343329')) newImg = BROKEN_PENCAI_IMAGES[2];
          else if (msg.image.includes('1541807084')) newImg = BROKEN_PENCAI_IMAGES[3];
          else if (msg.image.includes('1556228720')) newImg = BROKEN_PENCAI_IMAGES[4];
          else {
            newImg = BROKEN_PENCAI_IMAGES[0];
          }
          
          if (newImg !== msg.image) {
            replaced = true;
            chatUpdated = true;
            return { ...msg, image: newImg };
          }
        }
        return msg;
      });
      if (chatUpdated) {
        return { ...chat, messages: updatedMessages };
      }
      return chat;
    });

    if (replaced) {
      setChats(updatedChats);
    }
  }, [chats]);

  // Auto-scrolling the chat box to the bottom on activeChatId or chat list updates
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollChatToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollChatToBottom();
  }, [activeChatId, chats]);

  // Sync settings and chats to localStorage
  useEffect(() => {
    localStorage.setItem('cs_simulation_enabled', JSON.stringify(isSimEnabled));
  }, [isSimEnabled]);

  useEffect(() => {
    localStorage.setItem('cs_simulation_interval', simInterval.toString());
  }, [simInterval]);

  useEffect(() => {
    localStorage.setItem('cs_stream_enabled', JSON.stringify(toastStreamEnabled));
  }, [toastStreamEnabled]);

  useEffect(() => {
    localStorage.setItem('cs_stream_speed', toastStreamSpeed.toString());
  }, [toastStreamSpeed]);

  useEffect(() => {
    localStorage.setItem('cs_stream_limit', toastStreamLimit.toString());
  }, [toastStreamLimit]);

  useEffect(() => {
    localStorage.setItem('cs_complaint_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('cs_complaint_chats', JSON.stringify(chats));
  }, [chats]);

  // Set the first pending chat active if there is none
  useEffect(() => {
    if (!activeChatId && chats.length > 0) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, activeChatId]);

  // Spawns stream popper toasts at customizable rates and quantities (user speed/quantity control)
  useEffect(() => {
    if (!toastStreamEnabled) {
      setStreamToasts([]);
      return;
    }

    const spawnStreamToast = () => {
      if (templates.length === 0) return;
      
      const currentIdx = imageCycleRef.current;
      imageCycleRef.current = (imageCycleRef.current + 1) % BROKEN_PENCAI_IMAGES.length;

      const fName = CHINESE_FIRST_NAMES[Math.floor(Math.random() * CHINESE_FIRST_NAMES.length)];
      const lName = CHINESE_LAST_NAMES[Math.floor(Math.random() * CHINESE_LAST_NAMES.length)];
      const isMr = Math.random() > 0.4;
      const name = `${fName}${lName} (${isMr ? '先生' : '女士'})`;
      const phone = `01${Math.floor(Math.random() * 8) + 1}-${Math.floor(Math.random() * 900000 + 100000)}`;
      
      // Rotate through images and map aligned templates if possible
      const complaintImage = BROKEN_PENCAI_IMAGES[currentIdx];
      const complaintText = (templates[currentIdx] !== undefined)
        ? templates[currentIdx]
        : templates[Math.floor(Math.random() * templates.length)];
      
      const newToast = {
        id: `stream-toast-${Date.now()}-${Math.random()}`,
        name,
        phone,
        text: complaintText,
        image: complaintImage,
        timestamp: Date.now()
      };

      setStreamToasts(prev => {
        const updated = [...prev, newToast];
        if (updated.length > toastStreamLimit) {
          // Keep only the most recent up to toastStreamLimit
          return updated.slice(updated.length - toastStreamLimit);
        }
        return updated;
      });
    };

    // Spawn initial instantly
    spawnStreamToast();

    // Multiply by 1000 to convert seconds config to millisecond interval
    const intervalS = Math.max(0.2, toastStreamSpeed); // Safe clamp
    const intervalId = setInterval(() => {
      spawnStreamToast();
    }, intervalS * 1000);

    return () => clearInterval(intervalId);
  }, [toastStreamEnabled, toastStreamSpeed, toastStreamLimit, templates]);

  // Handle building a live chat sessions from a floating continuous popup popper
  const handleJoinChatFromStream = (toast: { name: string; phone: string; text: string; image: string; id: string }) => {
    // Check if the chat already exists to prevent duplicate entry
    const existing = chats.find(c => c.customerName === toast.name && c.customerPhone === toast.phone);
    if (existing) {
      setActiveChatId(existing.id);
      setStreamToasts(prev => prev.filter(t => t.id !== toast.id));
      setToastNotification(`已定位至 ${toast.name} 现有的服务会话中！`);
      setTimeout(() => setToastNotification(null), 3000);
      return;
    }

    const avatar = getCustomerAvatar(toast.name);

    const newChatId = `c-joined-${Date.now()}`;
    const newChat: ComplaintChat = {
      id: newChatId,
      customerName: toast.name,
      customerPhone: toast.phone,
      customerAvatar: avatar,
      status: 'pending',
      lastUpdated: Date.now(),
      hasUnread: true,
      messages: [
        {
          id: `m-joined-${Date.now()}`,
          sender: 'customer',
          text: toast.text,
          timestamp: Date.now(),
          image: toast.image
        }
      ]
    };

    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChatId);
    
    // Dismiss this popup from the stream since we are actively handling it
    setStreamToasts(prev => prev.filter(t => t.id !== toast.id));

    setToastNotification(`🔔 已成功接入与 ${toast.name} 的连线！请在中心输入您的赔付方案吧。`);
    setTimeout(() => setToastNotification(null), 4000);
  };

  // Complaint automatic generator simulator
  useEffect(() => {
    if (!isSimEnabled) return;

    const intervalId = setInterval(() => {
      generateRandomComplaint();
    }, simInterval * 1000);

    return () => clearInterval(intervalId);
  }, [isSimEnabled, simInterval, templates]);

  const generateRandomComplaint = () => {
    if (templates.length === 0) return;

    // Generate random Chinese name
    const fName = CHINESE_FIRST_NAMES[Math.floor(Math.random() * CHINESE_FIRST_NAMES.length)];
    const lName = CHINESE_LAST_NAMES[Math.floor(Math.random() * CHINESE_LAST_NAMES.length)];
    const isMr = Math.random() > 0.4;
    const name = `${fName}${lName} (${isMr ? '先生' : '女士'})`;
    
    // Choose random phone
    const phone = `01${Math.floor(Math.random() * 8) + 1}-${Math.floor(Math.random() * 900000 + 100000)}`;
    
    // Choose gender-appropriate and distinct avatar
    const avatar = getCustomerAvatar(name);

    const currentIdx = imageCycleRef.current;
    imageCycleRef.current = (imageCycleRef.current + 1) % BROKEN_PENCAI_IMAGES.length;

    // Rotate through images and map aligned templates if possible
    const complaintImage = BROKEN_PENCAI_IMAGES[currentIdx];
    const complaintText = (templates[currentIdx] !== undefined)
      ? templates[currentIdx]
      : templates[Math.floor(Math.random() * templates.length)];

    const newChatId = `c-sim-${Date.now()}`;
    const newChat: ComplaintChat = {
      id: newChatId,
      customerName: name,
      customerPhone: phone,
      customerAvatar: avatar,
      status: 'pending',
      lastUpdated: Date.now(),
      hasUnread: true,
      messages: [
        {
          id: `m-sim-${Date.now()}`,
          sender: 'customer',
          text: complaintText,
          timestamp: Date.now(),
          image: complaintImage
        }
      ]
    };

    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChatId);
    setToastNotification(`⚠️ 收到来自 ${name} 的新金林盆菜损坏投诉！`);

    // Play visual pulse or log message in sound alert, or clear toast after 5s
    setTimeout(() => {
      setToastNotification(null);
    }, 5000);
  };

  const handleSendMessage = (textToSend?: string) => {
    const finalMsg = textToSend || inputText;
    if (!finalMsg.trim() || !activeChatId) return;

    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        const updatedMsgs: ChatMessage[] = [
          ...chat.messages,
          {
            id: `m-reply-${Date.now()}`,
            sender: 'employee',
            text: finalMsg.trim(),
            timestamp: Date.now()
          }
        ];
        return {
          ...chat,
          status: 'replied',
          messages: updatedMsgs,
          lastUpdated: Date.now(),
          hasUnread: false
        };
      }
      return chat;
    }));

    if (!textToSend) {
      setInputText('');
    }
  };

  const handleSendPencaiCoupon = () => {
    if (!activeChatId) return;

    const couponText = `【盆菜专属补偿券】
券码：GOLDEN-PENCAI-88
面值：RM88.00 (无门槛直减)
适用范围：金林至尊臻品盆菜系列
有效期：即日起至2026年12月31日
[使用说明] 您好！因为这次的配送破损给您添堵了，我们深感愧疚！特此为您发放这张【RM88星级盆菜专属补偿券】！希望能弥补您的遗憾，也祝您合家欢乐！`;

    // Send the employee's message
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        const updatedMsgs: ChatMessage[] = [
          ...chat.messages,
          {
            id: `m-coupon-${Date.now()}`,
            sender: 'employee',
            text: couponText,
            timestamp: Date.now()
          }
        ];
        return {
          ...chat,
          status: 'replied',
          messages: updatedMsgs,
          lastUpdated: Date.now(),
          hasUnread: false
        };
      }
      return chat;
    }));

    // Trigger customer response to calm down after 2.5 seconds!
    const targetChatId = activeChatId;
    setTimeout(() => {
      setChats(prev => prev.map(chat => {
        if (chat.id === targetChatId) {
          // Check if already calmed down to avoid double response
          const alreadyCalmed = chat.messages.some(m => m.text.includes('消气') || m.text.includes('撤销投诉') || m.text.includes('生意兴隆'));
          if (alreadyCalmed) return chat;

          const customerRefundMsgs = [
            "哇，谢谢客服！老板做事真是太大气了，态度100分！这个金林盆菜的诚意我感受到了。既然你们主动送了RM88这么大的优惠券，之前的不愉快我就当一笔勾销了！我马上撤消对配送的投诉，下次还会跟你们定金林盆菜！辛苦了，祝生意兴隆！",
            "哎呀，看到你们客服这么负责，我的气一下就消了大半。这RM88的专属盆菜补偿代金券太惊喜了，说明你们是很用心在做品牌的。那我就原谅你们啦，这笔投诉就结案吧！多谢，祝你们生意兴隆！",
            "哇噻！竟然补偿了RM88的无门槛直减券！不得不说，品味客服的处理速度和格局真是让人心服口服。今晚糟糕的心情瞬间全好了！这券我收下了，下次过节肯定还会订你们的盆菜。给你点个大大的赞！"
          ];
          const chosenReply = customerRefundMsgs[Math.floor(Math.random() * customerRefundMsgs.length)];

          const systemMsg: ChatMessage = {
            id: `m-sys-${Date.now() + 1}`,
            sender: 'employee',
            text: `📢 系统提示: 客户已被诚意打动，成功消气并撤销投诉，当前投诉状态已自动流转为【已结案】。`,
            timestamp: Date.now() + 1000
          };

          const customerMsg: ChatMessage = {
            id: `m-customer-calm-${Date.now() + 2}`,
            sender: 'customer',
            text: chosenReply,
            timestamp: Date.now() + 2000
          };

          return {
            ...chat,
            status: 'resolved',
            hasUnread: true,
            messages: [...chat.messages, customerMsg, systemMsg],
            lastUpdated: Date.now() + 2000
          };
        }
        return chat;
      }));
    }, 2500);
  };

  const handleUpdateStatus = (status: 'processing' | 'resolved') => {
    if (!activeChatId) return;
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          status: chat.status === 'resolved' ? 'resolved' : status,
          hasUnread: false
        };
      }
      return chat;
    }));
  };

  const handleAddTemplate = () => {
    if (!newTemplateText.trim()) return;
    setTemplates(prev => [...prev, newTemplateText.trim()]);
    setNewTemplateText('');
  };

  const handleDeleteTemplate = (idx: number) => {
    setTemplates(prev => prev.filter((_, i) => i !== idx));
  };

  const handleResetAll = () => {
    if (window.confirm('确定要清除所有聊天记录和自定义设置并恢复为默认状态吗？')) {
      localStorage.removeItem('cs_complaint_chats');
      localStorage.removeItem('cs_complaint_templates');
      localStorage.removeItem('cs_simulation_enabled');
      localStorage.removeItem('cs_simulation_interval');
      window.location.reload();
    }
  };

  const handleMarkChatRead = (chatId: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, hasUnread: false } : c));
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  const themeClasses = {
    glass: isDarkMode ? 'bg-zinc-900/85 border-white/10 text-white' : 'bg-white/95 border-orange-200/40 text-zinc-900 shadow-xl',
    card: isDarkMode ? 'bg-white/[0.03] border-white/5 text-zinc-300' : 'bg-orange-50/40 border-orange-200/20 text-zinc-800 shadow-sm',
    activeCard: isDarkMode ? 'bg-accent-amber/10 border-accent-amber/40 text-white' : 'bg-accent-amber/10 border-accent-amber/50 text-zinc-900 font-bold',
    input: isDarkMode ? 'bg-black/50 border-white/10 text-white' : 'bg-white border-zinc-200 text-zinc-900',
    title: isDarkMode ? 'text-white' : 'text-zinc-900',
    muted: isDarkMode ? 'text-zinc-500' : 'text-zinc-400',
  };

  return (
    <div 
      style={{ 
        left: sidebarOpen ? (window.innerWidth < 768 ? '24px' : '368px') : '24px', 
        transition: 'left 0.5s cubic-bezier(0.22, 1, 0.36, 1)' 
      }}
      className={cn(
        "absolute right-6 top-6 bottom-6 z-20 flex flex-col md:flex-row gap-6 p-6 select-text overflow-hidden rounded-[30px] border",
        isDarkMode ? "bg-zinc-950/85 border-white/10" : "bg-[#fdf4e3]/90 border-orange-200/30 shadow-2xl"
      )}
    >
      
      {/* Dynamic Popups Notification Banner */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 bg-red-600 text-white font-bold text-sm md:text-base rounded-xl shadow-[0_10px_30px_rgba(239,68,68,0.4)] pointer-events-auto cursor-pointer"
            onClick={() => setToastNotification(null)}
          >
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <span>{toastNotification}</span>
            <button className="p-1 hover:bg-white/10 rounded ml-2">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT: Simulation controls & Custom complaint lists */}
      {showSimEngine && (
        <div className={cn("w-full md:w-72 flex flex-col h-full rounded-2xl border p-4 backdrop-blur-2xl transition-all overflow-hidden shrink-0", themeClasses.glass)}>
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-orange-200/10 shrink-0">
            <Sliders className="w-4 h-4 text-[#FF6B00]" />
            <h2 className="font-extrabold text-[#FF6B00] text-lg uppercase tracking-wider">自动投诉模拟引擎</h2>
          </div>

          {/* Configurations list */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar text-base">
            
            {/* Active switch */}
            <div className={cn("p-3 rounded-xl border bg-black/5 space-y-3", themeClasses.card)}>
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase text-[13px] tracking-wide">定时静默投诉生成</span>
                <button 
                  onClick={() => setIsSimEnabled(!isSimEnabled)}
                  className={cn(
                    "relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    isSimEnabled ? "bg-[#FF6B00]" : "bg-zinc-700"
                  )}
                >
                  <span className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    isSimEnabled ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>

              {isSimEnabled && (
                <div className="space-y-1.5 pt-1 border-t border-white/5">
                  <div className="flex justify-between items-center text-[13px] uppercase font-bold text-zinc-500">
                    <span>生成频率 (S)</span>
                    <span className="text-[#FF6B00] font-mono">{simInterval}秒 / 投诉</span>
                  </div>
                  <input 
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={simInterval}
                    onChange={(e) => setSimInterval(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#FF6B00]"
                  />
                </div>
              )}
            </div>

            {/* Continuous stream banner controls (requested: Speed and Quantity sliders) */}
            <div className={cn("p-3 rounded-xl border bg-black/5 space-y-3", themeClasses.card)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B00] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B00]"></span>
                  </span>
                  <span className="font-bold uppercase text-[13px] tracking-wide text-[#FF6B00]">实时投诉弹窗流</span>
                </div>
                <button 
                  onClick={() => setToastStreamEnabled(!toastStreamEnabled)}
                  className={cn(
                    "relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    toastStreamEnabled ? "bg-[#FF6B00]" : "bg-zinc-700"
                  )}
                >
                  <span className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    toastStreamEnabled ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>

              {toastStreamEnabled && (
                <div className="space-y-3.5 pt-1.5 border-t border-white/5">
                  {/* Speed Regulator Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[13px] uppercase font-bold text-zinc-400">
                      <span>弹窗出新频率 (速度)</span>
                      <span className="text-[#FF6B00] font-mono">{toastStreamSpeed}秒 / 次</span>
                    </div>
                    <input 
                      type="range"
                      min="0.5"
                      max="10.0"
                      step="0.5"
                      value={toastStreamSpeed}
                      onChange={(e) => setToastStreamSpeed(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#FF6B00]"
                    />
                  </div>

                  {/* Quantity Limit Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[13px] uppercase font-bold text-zinc-400">
                      <span>最大堆叠显示 (数量)</span>
                      <span className="text-[#FF6B00] font-mono">{toastStreamLimit}个 窗口</span>
                    </div>
                    <input 
                      type="range"
                      min="1"
                      max="8"
                      step="1"
                      value={toastStreamLimit}
                      onChange={(e) => setToastStreamLimit(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#FF6B00]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Core complaint photo bank preview */}
            <div className="space-y-2">
              <span className="text-[13px] uppercase tracking-widest text-[#FF6B00] opacity-60 font-black block">系统内置证据照片库 (损坏样本):</span>
              <div className="grid grid-cols-4 gap-1 select-none">
                {BROKEN_PENCAI_IMAGES.map((img, i) => (
                  <div key={i} className="aspect-square border border-red-500/20 rounded overflow-hidden cursor-zoom-in relative group shadow">
                    <img src={img} alt="损坏照片库" className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                    <div 
                      onClick={() => setLightboxImage(img)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[12px] text-white font-extrabold uppercase"
                    >
                      放大
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-zinc-500 leading-tight">随机生成的新投诉会自动附加来自照片库中一张“金林盆菜”碎裂损坏的照片。</p>
            </div>

            {/* Customized complaints texts templates */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[13px] uppercase tracking-widest text-[#FF6B00] opacity-60 font-black">自定义投诉语料库 ({templates.length}):</span>
                <button 
                  onClick={() => setTemplates(DEFAULT_COMPLAINT_TEMPLATES)}
                  className="text-[8px] text-[#FF6B00] font-bold uppercase underline hover:opacity-80"
                  title="重置为默认语料库"
                >
                  重设默认词
                </button>
              </div>
              
              {/* Template input */}
              <div className="flex gap-1.5">
                <input 
                  type="text"
                  value={newTemplateText}
                  onChange={(e) => setNewTemplateText(e.target.value)}
                  placeholder="录入自定义投诉问题..."
                  className={cn("flex-1 text-sm px-2 py-1 border rounded focus:border-[#FF6B00] outline-none", themeClasses.input)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTemplate();
                  }}
                />
                <button 
                  onClick={handleAddTemplate}
                  className="px-2 py-1 bg-[#FF6B00] text-white rounded text-sm font-extrabold hover:scale-105 active:scale-95 transition-all text-center"
                >
                  添加
                </button>
              </div>

              {/* List templates */}
              <div className="space-y-1.5 max-h-52 overflow-y-auto no-scrollbar border border-white/5 bg-black/10 p-2 rounded-xl">
                {templates.map((template, idx) => (
                  <div key={idx} className="p-1.5 bg-black/20 rounded border border-white/5 text-[13px] leading-relaxed flex gap-2 justify-between items-start">
                    <p className="flex-1 text-[#FF6B00]/90 select-text break-words pr-1 text-[13px]">{template}</p>
                    <button 
                      onClick={() => handleDeleteTemplate(idx)}
                      className="text-red-500 hover:text-red-400 p-0.5"
                      title="删除模板"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {templates.length === 0 && (
                  <div className="text-center py-4 text-[12px] opacity-30 select-none">
                    无语料信息。自动投诉生成将被挂起！
                  </div>
                )}
              </div>
              <p className="text-[12px] text-zinc-500 leading-tight">添加后，自动投诉生成器将以相等概率随机抽取上述模板进行模拟生成。</p>
            </div>

            {/* Reset operations */}
            <div className="pt-2 border-t border-white/5">
              <button 
                onClick={handleResetAll}
                className="w-full py-2 border border-red-500/25 hover:bg-red-500/10 text-red-500 text-sm font-black uppercase rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                清除所有会话和首选项
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEFT: Customer Complaint Chats list */}
      <div className={cn("w-full md:w-80 flex flex-col h-full rounded-2xl border p-4 backdrop-blur-2xl transition-all overflow-hidden", themeClasses.glass)}>
        <div className="flex flex-col gap-2.5 pb-3 mb-3 border-b border-orange-200/10">
          {/* Row 1: Title & Unread Count Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#FF6B00]" />
              <h2 className="font-extrabold text-[#FF6B00] text-sm md:text-base uppercase tracking-wider">投诉回访列表</h2>
            </div>
            {chats.filter(c => c.hasUnread).length > 0 && (
              <span className="bg-red-500 text-white font-black text-[11px] px-2 py-0.5 rounded-full animate-bounce">
                {chats.filter(c => c.hasUnread).length}未读
              </span>
            )}
          </div>

          {/* Row 2: Horizontal Align Controls */}
          <div className="grid grid-cols-3 gap-1.5 w-full">
            <button 
              onClick={() => setToastStreamEnabled(!toastStreamEnabled)}
              className={cn(
                "py-1.5 px-2 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-1 text-[11px] font-bold uppercase border cursor-pointer text-center",
                toastStreamEnabled 
                  ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30 font-extrabold" 
                  : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10"
              )}
              title={toastStreamEnabled ? "关闭实时投诉弹窗流" : "开启实时投诉弹窗流"}
            >
              {toastStreamEnabled ? (
                <>
                  <span className="relative flex h-1.5 w-1.5 shadow-sm">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                  </span>
                  <span className="truncate">弹窗中</span>
                </>
              ) : (
                <>
                  <BellOff className="w-2.5 h-2.5 text-zinc-400" />
                  <span className="truncate">已静音</span>
                </>
              )}
            </button>

            <button 
              onClick={generateRandomComplaint}
              className="py-1.5 px-2 bg-[#FF6B00]/10 border border-[#FF6B00]/20 hover:bg-[#FF6B00]/20 rounded-xl text-[#FF6B00] text-[11px] font-bold uppercase transition-transform active:scale-95 flex items-center justify-center gap-1 cursor-pointer text-center"
              title="手动触发一个新的盆菜投诉事件"
            >
              <Plus className="w-2.5 h-2.5" />
              <span className="truncate">测试投诉</span>
            </button>

            <button 
              onClick={() => setShowSimEngine(!showSimEngine)}
              className={cn(
                "py-1.5 px-2 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-1 text-[11px] font-bold uppercase border cursor-pointer text-center",
                showSimEngine 
                  ? "bg-[#FF6B00] text-white border-[#FF6B00]" 
                  : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10"
              )}
              title={showSimEngine ? "隐藏模拟引擎" : "展开模拟引擎"}
            >
              <Sliders className="w-2.5 h-2.5" />
              <span className="truncate">模拟器</span>
            </button>
          </div>
        </div>

        {/* Chats Filter Tab/Summary */}
        <div className="grid grid-cols-4 gap-1 text-[13px] font-bold text-center mb-3">
          <div className="bg-[#FF6B00]/10 text-[#FF6B00] rounded py-1">
            总共: {chats.length}
          </div>
          <div className="bg-red-500/10 text-red-500 rounded py-1">
            未处理: {chats.filter(c => c.status === 'pending').length}
          </div>
          <div className="bg-cyan-500/10 text-cyan-500 rounded py-1">
            回复中: {chats.filter(c => c.status === 'processing').length}
          </div>
          <div className="bg-green-500/10 text-green-500 rounded py-1">
            已解决: {chats.filter(c => c.status === 'resolved').length}
          </div>
        </div>

        {/* Chat List Box */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar select-none">
          {chats.map(chat => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const isSelected = chat.id === activeChatId;
            return (
              <div 
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id);
                  handleMarkChatRead(chat.id);
                }}
                className={cn(
                  "p-3 rounded-xl border cursor-pointer hover:scale-[1.01] transition-all relative",
                  isSelected ? themeClasses.activeCard : themeClasses.card,
                  chat.hasUnread && "border-red-500/40 bg-red-500/[0.02]"
                )}
              >
                {/* Unread dot badge */}
                {chat.hasUnread && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping z-10" />
                )}
                
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full border border-orange-200/20 overflow-hidden shrink-0 bg-orange-100">
                    {chat.customerAvatar ? (
                      <img src={chat.customerAvatar} alt={chat.customerName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-orange-900 bg-orange-100 uppercase font-black text-xs">
                        {chat.customerName.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="text-base font-black truncate max-w-[120px]">{chat.customerName}</p>
                      <span className="text-[12px] opacity-40 font-mono">
                        {new Date(chat.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm opacity-50 truncate mb-1">
                      {lastMsg ? lastMsg.text : "暂无信息"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-zinc-500 font-mono shrink-0">{chat.customerPhone || "无电话"}</span>
                      
                      {/* Status Badges */}
                      <span className={cn(
                        "text-[12px] font-bold px-1.5 py-0.5 rounded uppercase font-mono",
                        chat.status === 'pending' && "bg-red-500/15 text-red-500 border border-red-500/25",
                        chat.status === 'processing' && "bg-yellow-500/15 text-yellow-500 border border-yellow-500/25 animate-pulse",
                        chat.status === 'replied' && "bg-cyan-500/15 text-cyan-500 border border-cyan-500/25",
                        chat.status === 'resolved' && "bg-green-500/15 text-green-500 border border-green-500/25"
                      )}>
                        {chat.status === 'pending' && "待处理"}
                        {chat.status === 'processing' && "处理中"}
                        {chat.status === 'replied' && "已回复"}
                        {chat.status === 'resolved' && "已结案"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {chats.length === 0 && (
            <div className="text-center py-12 text-sm opacity-30 tracking-widest uppercase">
              暂无任何客人投诉记录
            </div>
          )}
        </div>
      </div>

      {/* MIDDLE: Active Chat details with Broken Image Display */}
      <div className={cn("flex-1 flex flex-col h-full rounded-2xl border p-4 backdrop-blur-2xl transition-all overflow-hidden", themeClasses.glass)}>
        {activeChat ? (
          <>
            {/* Chat header area */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-orange-200/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-orange-200/20 overflow-hidden bg-orange-100">
                  <img src={activeChat.customerAvatar} alt={activeChat.customerName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#FF6B00]">{activeChat.customerName}</h3>
                  <p className="text-sm text-zinc-500">
                    来电: {activeChat.customerPhone} &bull; 核心购买: 金林盆菜
                  </p>
                </div>
              </div>
              
              {/* Quick operations */}
              <div className="flex gap-1.5">
                <button 
                  onClick={() => handleUpdateStatus('processing')}
                  className={cn(
                    "px-2.5 py-1.5 text-[13px] font-bold rounded-lg border transition-all flex items-center gap-1",
                    activeChat.status === 'processing' 
                      ? "bg-yellow-500 text-black border-yellow-500" 
                      : "bg-white/5 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/10"
                  )}
                >
                  <Clock className="w-3 h-3 anim-pulse" />
                  设为处理中
                </button>
                <button 
                  onClick={() => handleUpdateStatus('resolved')}
                  disabled={activeChat.status === 'resolved'}
                  className={cn(
                    "px-2.5 py-1.5 text-[13px] font-bold rounded-lg border transition-all flex items-center gap-1",
                    activeChat.status === 'resolved' 
                      ? "bg-green-500 text-white border-green-500" 
                      : "bg-white/5 text-green-500 border-green-500/20 hover:bg-green-500/10"
                  )}
                >
                  <CheckCircle className="w-3 h-3" />
                  标记已解决 (结案)
                </button>
              </div>
            </div>

            {/* Chats Messages Feed */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 no-scrollbar">
              <div className="text-center py-2">
                <span className="text-[12px] bg-white/5 px-2.5 py-1 rounded-full text-zinc-500 font-mono tracking-widest uppercase">
                  品味安全客服加密通道 &bull; 双向通道已联通
                </span>
              </div>
              
              {activeChat.messages.map(msg => {
                const isCustomer = msg.sender === 'customer';
                const isSystem = msg.text.startsWith('📢 系统提示');
                const isCoupon = msg.text.includes('【盆菜专属补偿券】');

                if (isSystem) {
                  return (
                    <div key={msg.id} className="w-full flex justify-center my-3 px-4">
                      <div className={cn(
                        "rounded-xl py-2 px-4 text-sm md:text-base text-center font-bold flex items-center justify-center gap-2 max-w-[90%] border shadow-sm",
                        isDarkMode ? "bg-green-950/40 border-green-500/20 text-green-400" : "bg-green-50 border-green-200 text-green-700"
                      )}>
                        <span>{msg.text}</span>
                      </div>
                    </div>
                  );
                }

                if (isCoupon) {
                  return (
                    <div 
                      key={msg.id} 
                      className="flex gap-3 max-w-[85%] items-start self-end ml-auto flex-row-reverse"
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full border border-orange-200/15 overflow-hidden shrink-0 bg-orange-100">
                        <div className="w-full h-full flex items-center justify-center font-black text-base text-white bg-[#FF6B00]">品</div>
                      </div>

                      {/* Bubble Content styled as a premium coupon */}
                      <div className="space-y-1 mt-0.5 flex-1 select-text">
                        <div 
                          className={cn(
                            "rounded-2xl border text-base leading-relaxed overflow-hidden shadow-xl shadow-orange-500/5 relative",
                            isDarkMode ? "bg-zinc-900 border-orange-500/25 text-zinc-200" : "bg-white border-orange-200 text-zinc-800"
                          )}
                        >
                          {/* Card Header banner */}
                          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-2.5 text-white flex items-center justify-between">
                            <span className="font-extrabold text-sm tracking-wider flex items-center gap-1 uppercase">
                              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                              金林星级盆菜补偿专属券
                            </span>
                            <span className="text-sm bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold">可用</span>
                          </div>

                          {/* Coupon values layout */}
                          <div className="p-4 flex items-center justify-between gap-4 border-b border-dashed border-orange-500/25 relative">
                            {/* Left/Right scissor circle punches to look like a genuine physical ticket */}
                            <div className={cn("absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border", isDarkMode ? "bg-zinc-950 border-orange-500/25" : "bg-[#fdf4e3] border-orange-200")} />
                            <div className={cn("absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border", isDarkMode ? "bg-zinc-950 border-orange-500/25" : "bg-[#fdf4e3] border-orange-200")} />

                            <div className="pl-2">
                              <p className="text-sm text-zinc-500 uppercase font-bold">补偿面值金额</p>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-orange-500 font-extrabold text-base">RM</span>
                                <span className="text-orange-500 font-black text-5xl font-mono leading-none tracking-tighter">88</span>
                                <span className="text-zinc-500 text-sm ml-1">元 无门槛直减</span>
                              </div>
                            </div>

                            <div className="text-right pr-2">
                              <span className="text-sm bg-orange-500/10 text-orange-500 px-2 py-1 rounded font-black font-mono select-all inline-block border border-orange-500/20 shadow-sm cursor-pointer hover:scale-[1.02] transition-transform">
                                GOLDEN-PENCAI-88
                              </span>
                              <p className="text-[12px] opacity-40 mt-1">代码双击复制</p>
                            </div>
                          </div>

                          {/* Details explanatory lists */}
                          <div className={cn("p-3 space-y-1.5 text-[14px]", isDarkMode ? "bg-black/20" : "bg-orange-50/20")}>
                            <p className="font-extrabold text-orange-500 text-[14px]">【使用范围】金林至尊臻品盆菜系列</p>
                            <p className="opacity-70 text-[13px] leading-relaxed">由于本次商品在配送途中发生包装破损失误，我们深感愧疚。特为您全配此额度补偿券，希望能重连您的口福信心。期待您的原谅！</p>
                            <p className="opacity-40 text-[12px] pt-1 font-mono">有效期: 长期有效 &bull; 全店尊享</p>
                          </div>
                        </div>

                        <div className="text-[12px] opacity-40 font-mono px-1 text-right">
                          {new Date(msg.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex gap-3 max-w-[85%] items-start",
                      isCustomer ? "self-start" : "self-end ml-auto flex-row-reverse"
                    )}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full border border-orange-200/15 overflow-hidden shrink-0 bg-orange-100">
                      {isCustomer ? (
                        <img src={activeChat.customerAvatar} alt="Customer" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-base text-white bg-[#FF6B00]">品</div>
                      )}
                    </div>
                    
                    {/* Bubble Content */}
                    <div className="space-y-1 mt-0.5">
                      <div className={cn(
                        "p-3 rounded-2xl border text-base leading-relaxed",
                        isCustomer 
                          ? (isDarkMode ? "bg-white/[0.03] border-white/10 text-zinc-200 rounded-tl-none" : "bg-orange-50 border-orange-200/30 text-zinc-800 rounded-tl-none")
                          : "bg-[#FF6B00] border-[#FF6B00] text-white rounded-tr-none shadow-[0_4px_10px_rgba(255,107,0,0.15)]"
                      )}>
                        
                        {/* Text */}
                        <p>{msg.text}</p>
                        
                        {/* Image Attachment (Broken Pencai) */}
                        {msg.image && (
                          <div className="mt-3 rounded-lg overflow-hidden border border-red-500/20 group relative cursor-zoom-in">
                            <img 
                              src={msg.image} 
                              alt="损坏图片" 
                              className="max-h-96 w-full object-cover rounded-lg group-hover:scale-105 transition-transform" 
                              referrerPolicy="no-referrer"
                              onClick={() => setLightboxImage(msg.image || null)}
                            />
                            <div 
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm uppercase tracking-wider font-extrabold gap-1"
                              onClick={() => setLightboxImage(msg.image || null)}
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              点击放大细节 / 包装损坏证据
                            </div>
                            <div className="absolute bottom-2 left-2 bg-red-600/90 text-[12px] font-black uppercase text-white px-1.5 py-0.5 rounded tracking-widest flex items-center gap-1 shadow-sm">
                              <AlertTriangle className="w-2.5 h-2.5 animate-pulse" />
                              金林盆菜 运输损坏证据
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className={cn("text-[12px] opacity-40 font-mono px-1", !isCustomer && "text-right")}>
                        {new Date(msg.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Discount Coupon Promo Compensate Panel */}
            <div className="shrink-0 mb-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-orange-500/20 p-3 rounded-xl flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2">
                <span className="text-xl animate-bounce">🎁</span>
                <div className="text-left">
                  <p className="text-sm font-black text-orange-500 uppercase tracking-widest">【消气神品】专属盆菜无门槛补偿券</p>
                  <p className="text-[12px] text-zinc-400 leading-tight">一键向当前客户发送一张 RM88 盆菜满直减代金券。客户将立即撤消损坏投诉并和解！</p>
                </div>
              </div>
              <button
                onClick={handleSendPencaiCoupon}
                className="px-3.5 py-1.5 bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-lg tracking-wider uppercase shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all text-center flex items-center gap-1 inline-flex shrink-0 border border-orange-500/40"
              >
                <Sparkles className="w-3.5 h-3.5" />
                赠送优惠券
              </button>
            </div>

            {/* Quick replies shelf */}
            <div className="shrink-0 mb-3 block">
              <span className="text-[13px] opacity-40 uppercase font-black tracking-widest block mb-1.5 px-1">常用客服话术 (点击一键输入并回复):</span>
              <div className="flex flex-wrap gap-1.5 select-none max-h-24 overflow-y-auto no-scrollbar pr-1">
                {DEFAULT_QUICK_REPLIES.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(reply)}
                    className={cn(
                      "py-1.5 px-2.5 text-[13px] font-medium rounded-lg text-left border transition-all text-ellipsis overflow-hidden line-clamp-1 truncate max-w-full block hover:scale-[1.01] active:scale-95",
                      isDarkMode ? "bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10 hover:border-white/10" : "bg-orange-50/50 border-orange-200/20 text-zinc-700 hover:bg-orange-50 hover:border-orange-200/30"
                    )}
                    title={reply}
                  >
                    💬 {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="flex gap-2 bg-black/15 p-2 rounded-xl border border-orange-200/5 shrink-0">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="在此输入您的回复，按回车键直接发送..."
                className={cn(
                  "flex-1 text-base px-3 py-2 bg-transparent border-0 outline-none resize-none h-12 text-black",
                  "focus:ring-0 focus:outline-none"
                )}
                style={{ background: 'transparent' }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="w-12 bg-[#FF6B00] disabled:bg-[#FF6B00]/40 text-white rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 disabled:scale-100 transition-all shadow-md shadow-[#FF6B00]/20 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <MessageSquare className="w-12 h-12 text-zinc-600 mb-2 animate-bounce" />
            <p className="text-lg uppercase tracking-wider font-extrabold">暂未选中选中的服务会话</p>
            <p className="text-sm text-zinc-500 opacity-60 mt-1">请从左侧选择一个投诉记录展开详细交涉。</p>
          </div>
        )}
      </div>



      {/* LIGHTBOX MODAL: FULL SCREEN DETAIL PREVIEW */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/90 flex flex-col items-center justify-center p-4 cursor-zoom-out pointer-events-auto"
            onClick={() => setLightboxImage(null)}
          >
            <button 
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[80vh] overflow-hidden rounded-xl border border-white/10 bg-zinc-950 p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={lightboxImage} 
                alt="高精度损毁细节缩放" 
                className="max-h-[75vh] w-auto object-contain rounded-lg" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-4 right-4 text-center bg-black/60 backdrop-blur-md p-3 rounded border border-white/10 text-white select-text">
                <p className="text-base font-black uppercase tracking-widest text-[#FF6B00] flex items-center justify-center gap-1">
                  <AlertTriangle className="w-4 h-4 animate-bounce" />
                  金林盆菜 运输损坏调查细节 - 精准细节展示
                </p>
                <p className="text-[13px] text-zinc-400 font-mono mt-1">陶碗严重裂损 / 汤汁泼洒流失 / 导致不合配送准则</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continuous Pop-up Stream Cards Rendering Overlay (Speed & Quantity controlled) */}
      <div className="absolute right-6 bottom-20 z-40 w-80 md:w-85 max-h-[70vh] flex flex-col gap-3.5 pointer-events-none overflow-y-visible pr-1 pb-1">
        <AnimatePresence mode="popLayout">
          {streamToasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 200, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.9, y: -20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={cn(
                "pointer-events-auto w-full p-4 rounded-xl border shadow-xl flex flex-col gap-3 active:scale-[0.99] transition-transform backdrop-blur-xl relative overflow-hidden",
                isDarkMode 
                  ? "bg-zinc-950/95 border-red-500/30 text-white shadow-red-950/20" 
                  : "bg-white/95 border-red-500/25 text-zinc-900 shadow-zinc-300"
              )}
            >
              {/* Animated Warning Header */}
              <div className="flex items-center justify-between border-b border-red-500/10 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-bounce"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-sm font-black uppercase text-red-500 tracking-wider">
                    金林盆菜损坏警告 (实时)
                  </span>
                </div>
                <button 
                  onClick={() => setStreamToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Content Details */}
              <div className="flex gap-3 items-start">
                <div 
                  onClick={() => setLightboxImage(toast.image)}
                  className="w-16 h-16 rounded border border-red-500/20 overflow-hidden shrink-0 bg-black/20 cursor-zoom-in relative group"
                  title="点击查看证据细节"
                >
                  <img 
                    src={toast.image} 
                    alt="盆菜损坏细节" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[11px] text-white font-extrabold uppercase">
                    放大
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-bold text-[#FF6B00] truncate">{toast.name}</span>
                    <span className="text-[12px] opacity-40 font-mono">
                      {new Date(toast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className={cn(
                    "text-sm leading-relaxed line-clamp-2 select-text font-medium select-none cursor-default",
                    isDarkMode ? "text-zinc-300" : "text-zinc-600"
                  )}>
                    {toast.text}
                  </p>
                </div>
              </div>

              {/* Dynamic Interactive Drawer Actions */}
              <div className="flex gap-2 items-center justify-end border-t border-white/5 pt-2">
                <span className="text-[12px] text-zinc-500 font-mono mr-auto">{toast.phone}</span>
                <button 
                  onClick={() => setStreamToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="px-2.5 py-1 text-[13px] hover:bg-white/5 text-zinc-400 hover:text-zinc-200 rounded border border-white/10 transition-colors font-bold uppercase"
                >
                  忽略
                </button>
                <button 
                  onClick={() => handleJoinChatFromStream(toast)}
                  className="px-2.5 py-1 text-[13px] bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-extrabold rounded flex items-center gap-1 hover:scale-105 active:scale-95 transition-all shadow shadow-[#FF6B00]/20"
                >
                  <MessageSquare className="w-3 h-3" />
                  接入沟通
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
