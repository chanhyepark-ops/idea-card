import { useState } from 'react'
import './App.css'

type Idea = {
  id: string
  content: string
  isEditing: boolean
  draft: string
}

function App() {
  const [draft, setDraft] = useState('')
  const [ideas, setIdeas] = useState<Idea[]>([])

  const addIdea = () => {
    const content = draft.trim()

    if (!content) {
      return
    }

    setIdeas((current) => [
      {
        id: crypto.randomUUID(),
        content,
        isEditing: false,
        draft: content,
      },
      ...current,
    ])
    setDraft('')
  }

  const startEdit = (id: string) => {
    setIdeas((current) =>
      current.map((idea) =>
        idea.id === id
          ? { ...idea, isEditing: true, draft: idea.content }
          : idea,
      ),
    )
  }

  const updateIdeaDraft = (id: string, value: string) => {
    setIdeas((current) =>
      current.map((idea) => (idea.id === id ? { ...idea, draft: value } : idea)),
    )
  }

  const saveIdea = (id: string) => {
    setIdeas((current) =>
      current.map((idea) => {
        if (idea.id !== id) {
          return idea
        }

        const nextContent = idea.draft.trim()

        return {
          ...idea,
          content: nextContent || idea.content,
          draft: nextContent || idea.content,
          isEditing: false,
        }
      }),
    )
  }

  const cancelEdit = (id: string) => {
    setIdeas((current) =>
      current.map((idea) =>
        idea.id === id
          ? { ...idea, isEditing: false, draft: idea.content }
          : idea,
      ),
    )
  }

  const deleteIdea = (id: string) => {
    setIdeas((current) => current.filter((idea) => idea.id !== id))
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="eyebrow">Idea board</div>
        <h1>생각을 카드처럼 쌓아보세요</h1>
        <p className="hero-copy">
          입력창에 아이디어를 적고 저장하면 카드가 생성됩니다. 카드는 수정과
          삭제가 가능합니다.
        </p>

        <div className="composer">
          <label className="field-label" htmlFor="idea-input">
            새 아이디어
          </label>
          <textarea
            id="idea-input"
            className="composer-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="예: 신규 캠페인 제목, 썸네일 문구, 랜딩페이지 카피..."
            rows={5}
          />
          <div className="composer-actions">
            <span className="hint">
              Enter로 저장은 하지 않고, 버튼으로만 추가합니다.
            </span>
            <button type="button" className="primary-button" onClick={addIdea}>
              저장
            </button>
          </div>
        </div>
      </section>

      <section className="board-panel" aria-label="아이디어 보드">
        <div className="board-header">
          <div>
            <div className="section-label">Idea board</div>
            <h2>저장된 카드</h2>
          </div>
          <div className="card-count">{ideas.length} cards</div>
        </div>

        {ideas.length === 0 ? (
          <div className="empty-state">
            아직 카드가 없습니다. 왼쪽에 아이디어를 입력하고 저장해 보세요.
          </div>
        ) : (
          <div className="card-grid">
            {ideas.map((idea) => (
              <article key={idea.id} className="idea-card">
                {idea.isEditing ? (
                  <>
                    <textarea
                      className="card-editor"
                      value={idea.draft}
                      onChange={(event) =>
                        updateIdeaDraft(idea.id, event.target.value)
                      }
                      rows={6}
                    />
                    <div className="card-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => cancelEdit(idea.id)}
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => saveIdea(idea.id)}
                      >
                        저장
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="card-content">{idea.content}</p>
                    <div className="card-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => startEdit(idea.id)}
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => deleteIdea(idea.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default App
