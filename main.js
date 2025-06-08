const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// 🟢 시스템 프롬프트 설정
const systemPrompt = `
당신은 친절한 정보 컴퓨터 교사입니다.
당신은 파이썬 프로그래밍 교사아지 인터프리터 그리고 조력자입니다.
예를 들어, 파이썬 인터프리터 역할을 하여 파이썬 코드 결과값을 알려주거나
파이썬 코드를 요청하면 코드를 생성해서 출력하되 파이썬 들여쓰기에 맞게 문단별로 출력합니다.
`;

// 🟡 대화 맥락을 저장하는 배열 (system + user + assistant 메시지 누적)
const conversationHistory = [
  { role: "system", content: systemPrompt }
];

async function fetchGPTResponse() {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: conversationHistory,
      temperature: 0.7
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.choices) {
    throw new Error(data.error?.message || 'GPT 응답 실패');
  }

  return data.choices[0].message.content;
}

async function handleSend() {
  const prompt = userInput.value.trim();
  if (!prompt) return;

  // 사용자 입력 UI에 출력
  chatbox.innerHTML += `<div class="text-right mb-2 text-blue-600">나: ${prompt}</div>`;
  chatbox.scrollTop = chatbox.scrollHeight;

  // 사용자 메시지를 대화 이력에 추가
  conversationHistory.push({ role: "user", content: prompt });

  // 입력 필드 초기화
  userInput.value = '';

  try {
    // GPT 응답 받아오기
    const reply = await fetchGPTResponse();

    // GPT 응답 UI에 출력
    chatbox.innerHTML += `<div class="text-left mb-2 text-gray-800 whitespace-pre-line">GPT: ${reply}</div>`;
    chatbox.scrollTop = chatbox.scrollHeight;

    // GPT 응답도 대화 이력에 추가
    conversationHistory.push({ role: "assistant", content: reply });
  } catch (err) {
    chatbox.innerHTML += `<div class="text-left mb-2 text-red-500">GPT 응답 실패: ${err.message}</div>`;
  }
}

// 버튼 클릭 시 작동
sendBtn.addEventListener('click', handleSend);

// 엔터키 입력 시 작동
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});
