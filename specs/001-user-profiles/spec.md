# Feature Specification: User Profiles

**Feature Branch**: `002-user-profiles`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: User description: "기존 실시간 방명록 웹사이트에 사용자 프로필 기능을 추가하고 싶습니다. 사용자가 자신의 정체성을 표현할 수 있도록 닉네임과 프로필 이미지를 설정하고, 방명록 글 목록에는 작성자의 닉네임과 프로필 이미지가 표시되며, 프로필이 없는 사용자는 기본 닉네임과 기본 프로필 이미지로 표시되어야 합니다. 사용자는 본인의 프로필만 수정할 수 있고 기존 방명록 작성/조회 기능은 유지되어야 합니다. 관련 PRD는 memory-bank/profile-prd.md 를 기준으로 합니다."

## Clarifications

### Session 2026-05-06

- Q: Should profile changes update already-open guestbook list/detail screens immediately, or is reflection on subsequent load/re-entry sufficient? → A: Profile changes only need to appear on subsequent load or re-entry for the first release.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set My Profile (Priority: P1)

로그인한 사용자는 자신의 닉네임과 프로필 이미지를 설정하거나 변경하여 방명록에서 자신을 식별할 수 있게 한다.

**Why this priority**: 프로필 설정이 없으면 이후 목록/댓글에서 작성자를 표시할 사용자 정보가 부족하므로 기능의 핵심 가치가 성립하지 않는다.

**Independent Test**: 로그인한 사용자가 프로필 화면에서 닉네임과 이미지를 저장한 뒤 다시 프로필 화면에 진입해 저장된 값이 유지되는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 로그인한 사용자가 아직 프로필을 저장하지 않은 상태, **When** 닉네임과 프로필 이미지를 입력하고 저장하면, **Then** 사용자의 프로필이 생성되고 저장 성공 상태가 표시된다.
2. **Given** 로그인한 사용자가 기존 프로필을 가진 상태, **When** 닉네임 또는 프로필 이미지를 변경하고 저장하면, **Then** 사용자의 프로필이 새 값으로 갱신되고 이후 조회에서 변경된 값이 보인다.
3. **Given** 사용자가 닉네임 앞뒤에 공백을 입력한 상태, **When** 프로필을 저장하면, **Then** 앞뒤 공백이 제거된 닉네임이 저장되고 표시된다.

---

### User Story 2 - Identify Authors in Guestbook (Priority: P2)

방문자는 방명록 글 목록과 상세 화면에서 작성자의 닉네임과 프로필 이미지를 보고 누가 글과 댓글을 작성했는지 이해할 수 있다.

**Why this priority**: 프로필 기능의 사용자 가치가 실제 방명록 경험에 드러나는 핵심 흐름이며, 커뮤니티 유대감을 높이는 목적과 직접 연결된다.

**Independent Test**: 프로필이 있는 사용자가 방명록 글과 댓글을 작성한 뒤 목록과 상세 화면에서 해당 사용자의 닉네임과 프로필 이미지가 표시되는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 프로필을 설정한 사용자가 방명록 글을 작성한 상태, **When** 방문자가 방명록 목록을 보면, **Then** 해당 글에 작성자의 닉네임과 프로필 이미지가 표시된다.
2. **Given** 프로필을 설정한 사용자가 댓글을 작성한 상태, **When** 방문자가 글 상세 화면을 보면, **Then** 해당 댓글에 작성자의 닉네임과 프로필 이미지가 표시된다.
3. **Given** 작성자가 프로필을 변경한 상태, **When** 방문자가 이후 방명록 목록 또는 상세 화면을 조회하면, **Then** 변경된 프로필 정보가 작성자 표시 영역에 반영된다.

---

### User Story 3 - Show Defaults for Missing Profiles (Priority: P2)

방문자는 작성자가 프로필을 설정하지 않았거나 과거 데이터에 프로필 정보가 없더라도 기본 닉네임과 기본 프로필 이미지로 일관된 화면을 볼 수 있다.

**Why this priority**: 기존 방명록 데이터와 새 기능 사이의 호환성을 보장하고, 프로필 누락으로 화면이 깨지는 것을 방지한다.

**Independent Test**: 프로필이 없는 사용자 또는 과거 작성 데이터가 포함된 목록과 상세 화면을 열어 기본 표시가 적용되는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 작성자의 프로필이 없는 방명록 글이 있는 상태, **When** 방문자가 목록을 보면, **Then** 기본 닉네임과 기본 프로필 이미지가 표시된다.
2. **Given** 작성자의 프로필이 없는 댓글이 있는 상태, **When** 방문자가 상세 화면을 보면, **Then** 기본 닉네임과 기본 프로필 이미지가 표시된다.
3. **Given** 프로필 이미지가 없는 사용자가 닉네임만 설정한 상태, **When** 방문자가 작성자 정보를 보면, **Then** 설정된 닉네임과 기본 프로필 이미지가 함께 표시된다.

---

### User Story 4 - Protect Profile Ownership (Priority: P3)

로그인한 사용자는 본인의 프로필만 수정할 수 있고 다른 사용자의 닉네임이나 프로필 이미지를 변경할 수 없다.

**Why this priority**: 사용자 정체성 정보의 신뢰성을 유지하기 위한 보안 요구사항이다.

**Independent Test**: 두 개의 서로 다른 사용자 계정으로 로그인해 한 사용자가 다른 사용자의 프로필 변경을 시도했을 때 실패하는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 사용자 A와 사용자 B가 존재하는 상태, **When** 사용자 A가 사용자 B의 프로필 수정을 시도하면, **Then** 변경은 거부되고 사용자 B의 프로필은 바뀌지 않는다.
2. **Given** 로그인하지 않은 방문자가 프로필 화면에 접근한 상태, **When** 프로필 저장을 시도하거나 저장 화면에 진입하려 하면, **Then** 로그인 안내를 받고 프로필은 저장되지 않는다.

### Edge Cases

- 닉네임이 비어 있거나 공백만 있으면 저장을 거부하고 사용자가 이해할 수 있는 오류를 표시한다.
- 닉네임이 20자를 초과하면 저장을 거부하거나 입력 단계에서 제한한다.
- 지원하지 않는 이미지 형식 또는 2MB를 초과하는 이미지는 저장하지 않고 오류를 표시한다.
- 프로필 이미지 업로드 또는 저장 중 실패하면 기존 프로필 값은 유지되고 실패 상태가 표시된다.
- 프로필이 없는 과거 글과 댓글은 기존 작성/조회 흐름을 깨지 않고 기본 작성자 표시를 사용한다.
- 작성자의 계정 또는 프로필 정보가 조회되지 않는 경우에도 방명록 글과 댓글 본문은 계속 표시된다.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a profile screen where a logged-in user can view and edit their own nickname and profile image.
- **FR-002**: System MUST prevent users who are not logged in from saving profile information and guide them to sign in before editing a profile.
- **FR-003**: System MUST create a user's profile when they save profile information for the first time.
- **FR-004**: System MUST allow a logged-in user to update only their own profile.
- **FR-005**: System MUST reject attempts to modify another user's profile.
- **FR-006**: System MUST require nicknames to contain at least 1 and no more than 20 visible characters after trimming leading and trailing spaces.
- **FR-007**: System MUST store and display the trimmed nickname value.
- **FR-008**: System MUST allow profile images in common web image formats: PNG, JPEG, and WebP.
- **FR-009**: System MUST reject profile image files larger than 2MB.
- **FR-010**: System MUST show a preview of a selected profile image before the user saves it.
- **FR-011**: System MUST display loading, success, and error states for profile viewing and saving.
- **FR-012**: System MUST display the author's nickname and profile image on guestbook post list items when profile information is available.
- **FR-013**: System MUST display the author's nickname and profile image on comment items when profile information is available.
- **FR-014**: System MUST display a default nickname and default profile image when an author has no profile or no profile image.
- **FR-015**: System MUST continue to support existing guestbook post creation, post listing, post detail viewing, comment creation, and live update behavior after profile support is added.
- **FR-016**: System MUST use the current user's profile nickname as the default author display name for newly written comments when available.
- **FR-017**: System MUST keep existing author-name data usable for older comments so historical content remains readable.
- **FR-018**: System MUST expose only the minimum profile information needed for public author display: nickname and profile image.
- **FR-019**: System SHOULD make profile settings reachable from the existing signed-in user status area or primary navigation.

### Key Entities

- **User**: A signed-in person who can create guestbook posts, write comments, and manage only their own profile.
- **Profile**: Public display information for a user, including nickname, profile image, creation time, and last update time.
- **Guestbook Post**: An existing guestbook entry that remains viewable and gains author profile display when an author can be identified.
- **Comment**: An existing reply on a guestbook post that remains viewable and gains author profile display when an author can be identified.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of logged-in users can create or update a profile with a valid nickname and optional image in under 60 seconds.
- **SC-002**: 100% of guestbook posts and comments remain readable even when the author has no profile information.
- **SC-003**: 100% of unauthorized profile modification attempts in validation are rejected without changing the target profile.
- **SC-004**: 95% of profile changes become visible on subsequently loaded guestbook list or detail screens within 2 seconds under normal network conditions.
- **SC-005**: Existing guestbook creation, listing, detail viewing, comment creation, and live update validation scenarios continue to pass after profile support is added.
- **SC-006**: At least 90% of usability test participants can identify the author display area on a post or comment without additional instruction.

## Assumptions

- Existing sign-in behavior remains the identity source for determining which profile a user owns.
- Nickname duplication is allowed in the initial version, matching the PRD recommendation.
- The default nickname is a product-defined generic label such as "방문자"; the exact display text can be finalized during design without changing feature scope.
- The default profile image uses the existing hand-drawn visual style; the exact asset can be finalized during design without changing feature scope.
- Profile image replacement does not require immediate deletion of previously uploaded images in the initial version.
- Profile changes only need to appear on subsequently loaded list/detail screens for this feature; live cross-screen profile-change propagation can be considered separately if required.
- This specification does not change the existing user expectation that new guestbook posts and comments appear to other viewers without requiring a page reload.
