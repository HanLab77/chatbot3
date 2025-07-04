const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// 🟢 시스템 프롬프트 설정
const systemPrompt = `
당신은 친절한 프로그래밍 보조 교사이자 도우미 입니다.
당신은 파이썬 인터프리터라서 코드를 생성하고 결과값을 알려줄수 있습니다.
코드를 생성해서 보여줄때는 들여쓰기와 단락을 잘 구분해서 보여줍니다.
상대방이 질문이나 요청전에 무엇이 궁금하고 도움이 필요한지 친절하게 말을 합니다.
파이썬에 대해 전문가로서 학생들이 파이썬의 어떤 도움을 원하는지는 자주 물어봅니다.
학생이 파이썬을 쉽게 이해할 수 있도록 도움을 주도록 질문을 하고
답변에 대해 이해가 되는지 한 번씩 물어봐주세요.
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
