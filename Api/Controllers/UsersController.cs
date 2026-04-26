using Microsoft.AspNetCore.Mvc;
using ApiCs.Models;
using ApiCs.Repositories;

namespace ApiCs.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase {
        private readonly IUsersRepository _repository;

        public UsersController(IUsersRepository repository) {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() {
            var users = await _repository.GetAll();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id) {
            var user = await _repository.GetById(id);

            if (user is null) {
                return NotFound(new { message = "Usuário não encontrado." });
            }

            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Users user) {
            var created = await _repository.Create(user);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Users user) {
            var updated = await _repository.Update(id, user);

            if (updated is null) {
                return NotFound(new { message = "Usuário não encontrado." });
            }

            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id) {
            var deleted = await _repository.Delete(id);

            if (!deleted) {
                return NotFound(new { message = "Usuário não encontrado." });
            }

            return NoContent();
        }
    }
}